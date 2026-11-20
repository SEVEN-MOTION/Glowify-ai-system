import admin from 'firebase-admin';
import process from 'node:process';

// Provide the Firebase Admin service account JSON through the environment.
const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
if (!serviceAccountJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is required to run this script.');
}
const serviceAccount = JSON.parse(serviceAccountJson);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("✅ Initialized.");
  
  const db = admin.firestore();
  const collectionsToCreate = [
    'tenants',
    'automation_logs',
    'ai_insights',
    'event_logs',
    'ai_traces',
    'execution_traces'
  ];

  for (const colName of collectionsToCreate) {
    const docRef = db.collection(colName).doc('init');
    await docRef.set({ initialized: true });
    console.log(`✅ Created/verified collection: ${colName}`);
  }

  process.exit(0);
} catch (error) {
  console.error(error);
  process.exit(1);
}
