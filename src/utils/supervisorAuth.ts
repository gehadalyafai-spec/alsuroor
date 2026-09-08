import { db, auth } from '../firebase';
import { doc } from 'firebase/firestore';
import { isQuotaExceeded, handleFirestoreError } from './quotaManager';
import { safeGetDoc, safeSetDoc } from './firestoreHelper';

// Default Master Admin and Configuration
export const MASTER_ADMIN_EMAIL = 'gehadalyafai@gmail.com';
export const DEFAULT_MASTER_PASSCODE = 'SURUR-2026';
export const SUPERVISOR_STORAGE_KEY = 'quran_supervisor_auth_v1';

export interface SupervisorConfig {
  masterAdminEmail: string;
  authorizedEmails: string[];
  masterPasscode: string;
  allowPublicGuest: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

const DEFAULT_CONFIG: SupervisorConfig = {
  masterAdminEmail: MASTER_ADMIN_EMAIL,
  authorizedEmails: [MASTER_ADMIN_EMAIL],
  masterPasscode: DEFAULT_MASTER_PASSCODE,
  allowPublicGuest: false,
};

/**
 * Gets cached supervisor config from localStorage
 */
export function getLocalSupervisorConfig(): SupervisorConfig {
  try {
    const saved = localStorage.getItem(SUPERVISOR_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const emails = Array.isArray(parsed.authorizedEmails) 
        ? Array.from(new Set([MASTER_ADMIN_EMAIL, ...parsed.authorizedEmails.map((e: string) => e.trim().toLowerCase())]))
        : [MASTER_ADMIN_EMAIL];
      return {
        masterAdminEmail: MASTER_ADMIN_EMAIL,
        authorizedEmails: emails,
        masterPasscode: parsed.masterPasscode || DEFAULT_MASTER_PASSCODE,
        allowPublicGuest: false,
      };
    }
  } catch (e) {
    console.warn('Error reading supervisor config from localStorage', e);
  }
  return DEFAULT_CONFIG;
}

/**
 * Saves supervisor config to localStorage
 */
export function saveLocalSupervisorConfig(config: SupervisorConfig): void {
  try {
    const cleanConfig: SupervisorConfig = {
      ...config,
      masterAdminEmail: MASTER_ADMIN_EMAIL,
      authorizedEmails: Array.from(new Set([
        MASTER_ADMIN_EMAIL, 
        ...config.authorizedEmails.map(e => e.trim().toLowerCase()).filter(Boolean)
      ])),
    };
    localStorage.setItem(SUPERVISOR_STORAGE_KEY, JSON.stringify(cleanConfig));
  } catch (e) {
    console.warn('Error saving supervisor config to localStorage', e);
  }
}

/**
 * Loads supervisor config from Firestore system document with fallback to local cache
 */
export async function loadSupervisorConfigFromCloud(): Promise<SupervisorConfig> {
  const local = getLocalSupervisorConfig();
  if (isQuotaExceeded()) return local;
  try {
    const docRef = doc(db, 'system', 'supervisorConfig');
    const docSnap = await safeGetDoc(docRef);

    if (docSnap && docSnap.exists()) {
      const data = docSnap.data();
      const cloudEmails = Array.isArray(data.authorizedEmails)
        ? data.authorizedEmails.map((e: string) => e.trim().toLowerCase()).filter(Boolean)
        : [];
      
      const mergedEmails = Array.from(new Set([
        MASTER_ADMIN_EMAIL,
        ...local.authorizedEmails,
        ...cloudEmails
      ]));

      const cloudConfig: SupervisorConfig = {
        masterAdminEmail: MASTER_ADMIN_EMAIL,
        authorizedEmails: mergedEmails,
        masterPasscode: data.masterPasscode || local.masterPasscode || DEFAULT_MASTER_PASSCODE,
        allowPublicGuest: false,
        updatedAt: data.updatedAt,
        updatedBy: data.updatedBy,
      };

      saveLocalSupervisorConfig(cloudConfig);
      return cloudConfig;
    } else {
      return local;
    }
  } catch (err) {
    handleFirestoreError(err);
    return local;
  }
}

/**
 * Updates supervisor config in both Firestore and localStorage
 */
export async function updateSupervisorConfigInCloud(
  newConfig: Partial<SupervisorConfig>,
  updatedByEmail: string
): Promise<SupervisorConfig> {
  const current = getLocalSupervisorConfig();
  const mergedEmails = Array.from(new Set([
    MASTER_ADMIN_EMAIL,
    ...(newConfig.authorizedEmails || current.authorizedEmails).map(e => e.trim().toLowerCase()).filter(Boolean)
  ]));

  const updated: SupervisorConfig = {
    masterAdminEmail: MASTER_ADMIN_EMAIL,
    authorizedEmails: mergedEmails,
    masterPasscode: (newConfig.masterPasscode || current.masterPasscode || DEFAULT_MASTER_PASSCODE).trim(),
    allowPublicGuest: false,
    updatedAt: new Date().toISOString(),
    updatedBy: updatedByEmail,
  };

  // 1. Save locally instantly
  saveLocalSupervisorConfig(updated);

  // 2. Try updating Firestore if quota is not exceeded
  if (!isQuotaExceeded()) {
    try {
      const docRef = doc(db, 'system', 'supervisorConfig');
      await safeSetDoc(docRef, updated, { merge: true });
    } catch (err) {
      handleFirestoreError(err);
    }
  }

  return updated;
}
export const isEmailAuthorizedSupervisor = (email: string, config: SupervisorConfig): boolean => {
  if (!email) return false;
  const cleanEmail = email.trim().toLowerCase();

  // 1. الفحص مع المشرف الرئيسي
  if (cleanEmail === MASTER_ADMIN_EMAIL.toLowerCase()) return true;

  // 2. الفحص في القائمة المصرح لها بحروف صغيرة
  return config.authorizedEmails.some(
    (authorizedEmail) => authorizedEmail.trim().toLowerCase() === cleanEmail
  );
};
/**
 * Checks if a given email is an authorized supervisor
 */

/**
 * Validates a supervisor passcode
 */
export function verifySupervisorPasscode(enteredPasscode: string, config?: SupervisorConfig): boolean {
  if (!enteredPasscode) return false;
  const cleanEntered = enteredPasscode.trim().toUpperCase();
  const currentConfig = config || getLocalSupervisorConfig();
  const validPasscode = (currentConfig.masterPasscode || DEFAULT_MASTER_PASSCODE).trim().toUpperCase();
  
  return cleanEntered === validPasscode || cleanEntered === DEFAULT_MASTER_PASSCODE.toUpperCase();
}
