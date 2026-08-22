import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!projectId || !clientEmail || !privateKey) {
  throw new Error('Firebase Admin production configuration is missing');
}

const app = getApps()[0] ?? initializeApp({
  credential: cert({ projectId, clientEmail, privateKey }),
});

export const adminAuth = getAuth(app);
export const db = getFirestore(app);
