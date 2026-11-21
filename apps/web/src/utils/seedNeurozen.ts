import admin from 'firebase-admin';
import { 
  NEUROZEN_PRODUCTS, 
  SHOPIFY_WEBHOOKS, 
  AGENT_FLEET_LOGS 
} from './neurozenMockData';

/**
 * NEUROZEN LAB - Firestore Seeder
 * Populates Firestore with enterprise-grade mock data for functional supplements.
 */

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is required to run this seeder.');
    }
    const serviceAccount = JSON.parse(serviceAccountJson);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error) {
    console.error('Firebase Admin Initialization Error:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function seedNeurozen() {
  console.log('🚀 Starting Neurozen Lab Seeding...');
  const storeId = 'neurozen_lab';
  const storeRef = db.collection('stores').doc(storeId);

  try {
    // 1. Create/Update Store Document
    await storeRef.set({
      name: 'NEUROZEN LAB',
      specialization: 'Functional Dietary Supplements',
      status: 'active',
      last_seeded: admin.firestore.FieldValue.serverTimestamp(),
      currency: 'USD',
      timezone: 'America/Los_Angeles'
    }, { merge: true });
    console.log('✅ Store document initialized.');

    // 2. Seed Products Sub-collection
    console.log('📦 Seeding Products...');
    const productBatch = db.batch();
    NEUROZEN_PRODUCTS.forEach((product) => {
      const pRef = storeRef.collection('products').doc(product.id);
      productBatch.set(pRef, {
        ...product,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await productBatch.commit();
    console.log(`✅ ${NEUROZEN_PRODUCTS.length} products seeded.`);

    // 3. Seed Webhooks Queue Sub-collection
    console.log('⚡ Seeding Webhooks Queue...');
    const webhookBatch = db.batch();
    SHOPIFY_WEBHOOKS.forEach((webhook) => {
      const wRef = storeRef.collection('webhooks_queue').doc(webhook.id);
      webhookBatch.set(wRef, {
        ...webhook,
        processedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await webhookBatch.commit();
    console.log(`✅ ${SHOPIFY_WEBHOOKS.length} webhook events seeded.`);

    // 4. Seed Agent Telemetry Sub-collection
    console.log('🤖 Seeding Agent Telemetry...');
    const agentBatch = db.batch();
    AGENT_FLEET_LOGS.forEach((log) => {
      const lRef = storeRef.collection('agent_telemetry').doc(log.id);
      agentBatch.set(lRef, {
        ...log,
        receivedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    });
    await agentBatch.commit();
    console.log(`✅ ${AGENT_FLEET_LOGS.length} agent logs seeded.`);

    console.log('✨ Neurozen Lab Seeding Complete! Workspace is ready.');
  } catch (error) {
    console.error('❌ Seeding Failed:', error);
  } finally {
    process.exit(0);
  }
}

// Execute the seeder
seedNeurozen();
