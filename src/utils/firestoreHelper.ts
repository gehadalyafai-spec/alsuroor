import { 
  doc, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  collection, 
  addDoc, 
  getDocs, 
  DocumentReference, 
  DocumentSnapshot, 
  CollectionReference, 
  Query, 
  QuerySnapshot 
} from 'firebase/firestore';
import { auth } from '../firebase';
import { isQuotaExceeded, handleFirestoreError } from './quotaManager';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreErrorWithContext(error: unknown, operationType: OperationType, path: string | null) {
  const isPermission = error instanceof Error && (
    error.message.includes('insufficient permissions') ||
    error.message.includes('permission-denied') ||
    (error as any).code === 'permission-denied'
  );
  if (isPermission) {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
        isAnonymous: auth.currentUser?.isAnonymous,
        tenantId: auth.currentUser?.tenantId,
        providerInfo: auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
}

const TIMEOUT_MS = 6000;

/**
 * Recursively strips undefined values from an object or array so Firestore setDoc/addDoc never throws.
 * Preserves Firestore sentinel values (serverTimestamp, deleteField, etc.)
 */
export function cleanFirestoreData<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => cleanFirestoreData(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    // Keep Firestore FieldValue instances intact
    if (
      (data as any)?._methodName !== undefined || 
      (data as any)?.constructor?.name === 'FieldValue' ||
      typeof (data as any)?.isEqual === 'function'
    ) {
      return data;
    }
    const clean: Record<string, any> = {};
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined) {
        clean[key] = cleanFirestoreData(val);
      }
    }
    return clean as unknown as T;
  }
  return data;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number = TIMEOUT_MS): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs))
  ]);
}

export async function safeGetDoc(docRef: DocumentReference): Promise<DocumentSnapshot | null> {
  if (isQuotaExceeded()) return null;
  try {
    return await withTimeout(getDoc(docRef));
  } catch (err) {
    handleFirestoreError(err);
    handleFirestoreErrorWithContext(err, OperationType.GET, docRef.path);
    if (isQuotaExceeded()) return null;
    throw err;
  }
}

export async function safeSetDoc(docRef: DocumentReference, data: any, options?: any): Promise<void> {
  if (isQuotaExceeded()) {
    console.warn('[Firestore] Quota reached, write gracefully bypassed to keep local data intact');
    return;
  }
  try {
    const cleaned = cleanFirestoreData(data);
    if (options) {
      await withTimeout(setDoc(docRef, cleaned, options));
    } else {
      await withTimeout(setDoc(docRef, cleaned));
    }
  } catch (err) {
    handleFirestoreError(err);
    handleFirestoreErrorWithContext(err, OperationType.WRITE, docRef.path);
    if (isQuotaExceeded()) return;
    throw err;
  }
}

export async function safeDeleteDoc(docRef: DocumentReference): Promise<void> {
  if (isQuotaExceeded()) {
    console.warn('[Firestore] Quota reached, delete gracefully bypassed');
    return;
  }
  try {
    await withTimeout(deleteDoc(docRef));
  } catch (err) {
    handleFirestoreError(err);
    handleFirestoreErrorWithContext(err, OperationType.DELETE, docRef.path);
    if (isQuotaExceeded()) return;
    throw err;
  }
}

export async function safeAddDoc(collRef: CollectionReference, data: any): Promise<DocumentReference | null> {
  if (isQuotaExceeded()) {
    console.warn('[Firestore] Quota reached, addDoc gracefully bypassed');
    return null;
  }
  try {
    const cleaned = cleanFirestoreData(data);
    return await withTimeout(addDoc(collRef, cleaned));
  } catch (err) {
    handleFirestoreError(err);
    handleFirestoreErrorWithContext(err, OperationType.CREATE, collRef.path);
    if (isQuotaExceeded()) return null;
    throw err;
  }
}

export async function safeGetDocs(queryRef: Query): Promise<QuerySnapshot | null> {
  if (isQuotaExceeded()) return null;
  try {
    return await withTimeout(getDocs(queryRef));
  } catch (err) {
    handleFirestoreError(err);
    handleFirestoreErrorWithContext(err, OperationType.LIST, null);
    if (isQuotaExceeded()) return null;
    throw err;
  }
}
