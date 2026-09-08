import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, memoryLocalCache, setLogLevel, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Silence internal Firestore stream error logs to prevent noisy console backoff warnings during quota limits
try {
  setLogLevel('silent');
} catch {}

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore with memory cache so failed write streams are not persisted across browser refreshes
export const db = firebaseConfig.firestoreDatabaseId
  ? initializeFirestore(app, { localCache: memoryLocalCache() }, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, { localCache: memoryLocalCache() });

// Validate connection to Firestore on initial boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}
testConnection();

export default app;
