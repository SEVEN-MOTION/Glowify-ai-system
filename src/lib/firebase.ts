// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  User,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
  collection,
  query,
  getDocs,
  orderBy,
  limit,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';

const firebaseEnv = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const requiredFirebaseConfig = [
  ['VITE_FIREBASE_API_KEY', firebaseEnv.apiKey],
  ['VITE_FIREBASE_AUTH_DOMAIN', firebaseEnv.authDomain],
  ['VITE_FIREBASE_PROJECT_ID', firebaseEnv.projectId],
  ['VITE_FIREBASE_STORAGE_BUCKET', firebaseEnv.storageBucket],
  ['VITE_FIREBASE_MESSAGING_SENDER_ID', firebaseEnv.messagingSenderId],
  ['VITE_FIREBASE_APP_ID', firebaseEnv.appId],
] as const;

const missingFirebaseConfig = requiredFirebaseConfig
  .filter(([, value]) => !value)
  .map(([name]) => name);

if (missingFirebaseConfig.length > 0) {
  throw new Error(
    `Glowify Firebase configuration is incomplete. Missing: ${missingFirebaseConfig.join(', ')}`
  );
}

const firebaseConfig = {
  apiKey: firebaseEnv.apiKey,
  authDomain: firebaseEnv.authDomain,
  projectId: firebaseEnv.projectId,
  storageBucket: firebaseEnv.storageBucket,
  messagingSenderId: firebaseEnv.messagingSenderId,
  appId: firebaseEnv.appId,
  ...(firebaseEnv.measurementId ? { measurementId: firebaseEnv.measurementId } : {}),
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

setPersistence(auth, browserLocalPersistence).catch(err => {
  console.error("Firebase persistence failed:", err.message);
});

export const googleProvider = new GoogleAuthProvider();

const parseAuthError = (code: string): string => {
  const map: Record<string, string> = {
    'auth/user-not-found':         'No account found with this email.',
    'auth/wrong-password':         'Incorrect password. Please try again.',
    'auth/invalid-credential':     'Invalid email or password.',
    'auth/invalid-email':          'Please enter a valid email address.',
    'auth/email-already-in-use':   'An account with this email already exists.',
    'auth/weak-password':          'Password must be at least 6 characters.',
    'auth/popup-closed-by-user':   'Sign-in popup closed. Please try again.',
    'auth/popup-blocked':          'Popup blocked. Allow popups for this site.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/too-many-requests':      'Too many attempts. Please wait and try again.',
    'auth/operation-not-allowed':  'This sign-in method is not enabled in Firebase Console.',
    'auth/cancelled-popup-request':'Sign-in cancelled. Please try again.',
  }
  return map[code] || `Error (${code}). Please try again.`
}

export const firebaseAuth = {
  signInWithEmail: async (email: string, password: string) => {
    try {
      if (!auth) throw new Error('Firebase auth not initialized')
      const result = await signInWithEmailAndPassword(auth, email, password)
      return { user: result.user, error: null }
    } catch (err: any) {
      return { user: null, error: parseAuthError(err.code) }
    }
  },

  signUpWithEmail: async (email: string, password: string, displayName?: string, storeName?: string) => {
    try {
      if (!auth) throw new Error('Firebase auth not initialized')
      const result = await createUserWithEmailAndPassword(auth, email, password)
      if (displayName) await updateProfile(result.user, { displayName })
      await firestoreHelpers.createUserProfile(result.user, { displayName, storeName })
      await firestoreHelpers.seedMockData(result.user.uid)
      return { user: result.user, error: null }
    } catch (err: any) {
      return { user: null, error: parseAuthError(err.code) }
    }
  },

  signInWithGoogle: async () => {
    try {
      if (!auth) throw new Error('Firebase Auth not initialized')
      const result = await signInWithPopup(auth, googleProvider)
      return { user: result.user, error: null }
    } catch (err: any) {
      return { user: null, error: parseAuthError(err.code) }
    }
  },

  signOut: async () => {
    if (!auth) throw new Error('Firebase Auth not initialized')
    return firebaseSignOut(auth)
  },

  resetPassword: async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { error: null }
    } catch (err: any) {
      return { error: parseAuthError(err.code) }
    }
  },

  onAuthStateChanged: (callback: (user: User | null) => void) => {
    if (!auth) {
      setTimeout(() => callback(null), 0)
      return () => {}
    }
    return onAuthStateChanged(auth, callback)
  },
}

export const firestoreHelpers = {
  profileExists: async (uid: string) => {
    try {
      if (!db) return false;
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists();
    } catch { return false; }
  },

  createUserProfile: async (user: User, extra: { displayName?: string; storeName?: string } = {}) => {
    if (!db) return;
    try {
      await setDoc(doc(db, 'users', user.uid), {
        uid:               user.uid,
        email:             user.email,
        displayName:       extra.displayName || user.displayName || user.email?.split('@')[0] || 'User',
        storeName:         extra.storeName || 'My Store',
        plan:              'Enterprise',
        planStatus:        'Active',
        updatedAt:         serverTimestamp(),
      }, { merge: true });
    } catch (err: any) {
      console.error('Glowify: createUserProfile failed:', err.message);
    }
  },

  getProfile: async (uid: string) => {
    if (!db) return null;
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err: any) {
      return null;
    }
  },

  getData: async (uid: string, collectionName: string, limitNum: number = 100) => {
    if (!db) return [];
    try {
      const q = query(
        collection(db, 'users', uid, collectionName),
        orderBy('createdAt', 'desc'),
        limit(limitNum)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    } catch (err: any) {
      return [];
    }
  },

  seedMockData: async (_uid: string) => {
    return;
  },

  // Subscribe to real-time telemetry/logs
  subscribeToLogs: (uid: string, callback: (logs: any[]) => void): Unsubscribe => {
    if (!db) {
      callback([]);
      return () => {};
    }
    
    const q = query(
      collection(db, 'users', uid, 'telemetry'),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || new Date()
      }));
      callback(logs);
    }, (error) => {
      console.error('Error subscribing to logs:', error);
      callback([]);
    });
  },

  // Subscribe to agent states
  subscribeToAgents: (uid: string, callback: (agents: any[]) => void): Unsubscribe => {
    if (!db) {
      callback([]);
      return () => {};
    }
    
    const q = query(collection(db, 'users', uid, 'agents'));

    return onSnapshot(q, (snapshot) => {
      const agents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(agents);
    }, (error) => {
      console.error('Error subscribing to agents:', error);
      callback([]);
    });
  },
};
