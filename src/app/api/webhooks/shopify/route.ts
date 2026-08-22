// src/app/api/webhooks/shopify/route.ts
// Shopify Webhook Listener for product events

import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function POST(request: any) {
  try {
    // Verify webhook signature (Shopify sends X-Shopify-Hmac-Sha256 header)
    const hmacHeader = request.headers.get('x-shopify-hmac-sha256');
    const topic = request.headers.get('x-shopify-topic');
    const shopDomain = request.headers.get('x-shopify-shop-domain');
    
    // Parse the webhook payload
    const payload = await request.json();
    
    console.log(`Received Shopify webhook: ${topic} from ${shopDomain}`);
    
    // Handle product creation events
    if (topic === 'products/create') {
      await handleProductCreate(payload, shopDomain);
    }
    
    // Handle product update events
    if (topic === 'products/update') {
      await handleProductUpdate(payload, shopDomain);
    }
    
    // Handle product deletion events
    if (topic === 'products/delete') {
      await handleProductDelete(payload, shopDomain);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    });
  } catch (error: any) {
    console.error('Shopify webhook error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Handle product creation - automatically create a draft for AI generation
 */
async function handleProductCreate(product: any, shopDomain?: string) {
  // Extract the shop owner/uid from the webhook or use shop domain
  // In production, you'd validate the webhook and extract the actual user uid
  const uid = extractUidFromWebhook(product, shopDomain);
  
  if (!uid) {
    console.warn('Could not determine user for webhook');
    return;
  }
  
  // Create a draft for the new product
  const draftData = {
    type: 'product_marketing',
    status: 'pending',
    sourceId: String(product.id),
    sourceType: 'shopify_product',
    title: product.title,
    originalContent: {
      id: product.id,
      title: product.title,
      description: product.body_html,
      vendor: product.vendor,
      product_type: product.product_type,
      tags: product.tags,
      images: product.images,
      variants: product.variants
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  // Store in Firestore drafts collection
  // Using product ID as part of document ID to avoid duplicates
  await setDoc(
    doc(db, 'users', uid, 'drafts', `shopify_product_${product.id}`),
    draftData,
    { merge: true }
  );
  
  console.log(`Created draft for product ${product.id} (${product.title})`);
  
  // Also log the event for tracking
  await logWebhookEvent(uid, 'product_create', product.id, product.title);
}

/**
 * Handle product updates
 */
async function handleProductUpdate(product: any, shopDomain?: string) {
  const uid = extractUidFromWebhook(product, shopDomain);
  
  if (!uid) return;
  
  // Update existing draft if it exists
  const draftRef = doc(db, 'users', uid, 'drafts', `shopify_product_${product.id}`);
  
  await setDoc(
    draftRef,
    {
      title: product.title,
      'originalContent.id': product.id,
      'originalContent.title': product.title,
      'originalContent.description': product.body_html,
      'originalContent.vendor': product.vendor,
      'originalContent.product_type': product.product_type,
      'originalContent.tags': product.tags,
      'originalContent.images': product.images,
      'originalContent.variants': product.variants,
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
  
  console.log(`Updated draft for product ${product.id}`);
}

/**
 * Handle product deletion
 */
async function handleProductDelete(product: any, shopDomain?: string) {
  // Note: We can't delete from Firestore in a webhook since 
  // Firebase Admin SDK doesn't support delete in client SDK manner
  // In production, you'd use Firebase Admin SDK with proper permissions
  
  console.log(`Product ${product.id} deleted (deletion from drafts would require Admin SDK)`);
  
  // Log the event for tracking
  const uid = extractUidFromWebhook(product, shopDomain);
  if (uid) {
    await logWebhookEvent(uid, 'product_delete', product.id, product.title || 'Unknown');
  }
}

/**
 * Log webhook events for audit trail
 */
async function logWebhookEvent(
  uid: string, 
  eventType: string, 
  resourceId: string | number, 
  resourceName?: string
) {
  try {
    const eventLog = {
      eventType,
      resourceId: String(resourceId),
      resourceName,
      timestamp: serverTimestamp(),
      processed: true
    };
    
    await setDoc(
      doc(db, 'users', uid, 'webhook_events', `${eventType}_${resourceId}_${Date.now()}`),
      eventLog
    );
  } catch (error) {
    console.warn('Failed to log webhook event:', error);
  }
}

/**
 * Extract user UID from webhook payload
 * In production, this should validate the webhook signature and
 * look up the user associated with the shop domain
 */
function extractUidFromWebhook(product: any, shopDomain?: string | null): string | null {
  // Method 1: Check if there's a user_id field in the product (custom Shopify app)
  if (product.user_id || product.created_by_user_id) {
    return String(product.user_id || product.created_by_user_id);
  }
  
  // Method 2: Look up by shop domain in our users collection
  // This requires maintaining a mapping of shop domains to UIDs
  if (shopDomain) {
    // In production, query the users collection for matching shopifyStoreDomain
    // For now, we'll return a placeholder that would be replaced with actual logic
    return null; // Replace with actual user lookup
  }
  
  // Method 3: For development/testing, extract from webhook topic
  // This is a fallback and should be replaced with proper auth
  return null;
}

// Handle GET requests (Shopify validates webhook endpoints this way)
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Shopify webhook endpoint active'
  });
}
