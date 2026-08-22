import crypto from 'crypto';
import { getAdminServices } from '../../../packages/worker/firebase-admin.js';

const STATE_TTL_MS = 10 * 60 * 1000;
const TOKEN_ALGORITHM = 'aes-256-gcm';

export function getShopifyConfig() {
  const clientId = process.env.SHOPIFY_CLIENT_ID || process.env.SHOPIFY_API_KEY;
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || process.env.SHOPIFY_API_SECRET;
  const scopes = process.env.SHOPIFY_SCOPES || 'read_products,read_orders,read_customers,read_inventory';
  const appUrl = process.env.SHOPIFY_APP_URL || 'https://glowify-ai-system.vercel.app';

  if (!clientId || !clientSecret) return null;
  return { clientId, clientSecret, scopes, appUrl: appUrl.replace(/\/$/, '') };
}

export function normalizeShopDomain(value: string | null | undefined) {
  const raw = (value || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '');
  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(raw)) return null;
  return raw;
}

function stateSecret() {
  const config = getShopifyConfig();
  if (!config) throw new Error('Shopify OAuth is not configured');
  return config.clientSecret;
}

function signState(payload: Record<string, string | number>) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', stateSecret()).update(encoded).digest('base64url');
  return `${encoded}.${signature}`;
}

export function verifyState(state: string) {
  const [encoded, signature] = state.split('.');
  if (!encoded || !signature) return null;
  const expected = crypto.createHmac('sha256', stateSecret()).update(encoded).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as Record<string, unknown>;
  if (typeof payload.createdAt !== 'number' || Date.now() - payload.createdAt > STATE_TTL_MS) return null;
  if (typeof payload.uid !== 'string' || typeof payload.shop !== 'string' || typeof payload.nonce !== 'string') return null;
  return payload as { uid: string; shop: string; nonce: string; createdAt: number };
}

export async function verifyBearer(req: { headers: Record<string, string | string[] | undefined> }) {
  const header = req.headers.authorization;
  if (Array.isArray(header) || !header?.startsWith('Bearer ')) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  const { adminAuth } = getAdminServices();
  return adminAuth.verifyIdToken(token);
}

export function encryptAccessToken(token: string) {
  const keyValue = process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY;
  if (!keyValue) throw new Error('Shopify token encryption is not configured');
  const key = Buffer.from(keyValue, 'hex');
  if (key.length !== 32) throw new Error('SHOPIFY_TOKEN_ENCRYPTION_KEY must be 64 hex characters');
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(TOKEN_ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString('base64url')}.${tag.toString('base64url')}.${encrypted.toString('base64url')}`;
}

export function decryptAccessToken(value: string) {
  const keyValue = process.env.SHOPIFY_TOKEN_ENCRYPTION_KEY;
  if (!keyValue) throw new Error('Shopify token encryption is not configured');
  const key = Buffer.from(keyValue, 'hex');
  if (key.length !== 32) throw new Error('SHOPIFY_TOKEN_ENCRYPTION_KEY must be 64 hex characters');
  const [ivValue, tagValue, encryptedValue] = value.split('.');
  const decipher = crypto.createDecipheriv(TOKEN_ALGORITHM, key, Buffer.from(ivValue, 'base64url'));
  decipher.setAuthTag(Buffer.from(tagValue, 'base64url'));
  return Buffer.concat([decipher.update(Buffer.from(encryptedValue, 'base64url')), decipher.final()]).toString('utf8');
}

export async function createOAuthState(uid: string, shop: string) {
  const nonce = crypto.randomBytes(18).toString('base64url');
  const { db } = getAdminServices();
  await db.collection('shopifyOAuthStates').doc(nonce).set({
    uid,
    shop,
    createdAt: Date.now(),
    expiresAt: Date.now() + STATE_TTL_MS,
  });
  return signState({ uid, shop, nonce, createdAt: Date.now() });
}

export async function consumeOAuthState(nonce: string, uid: string, shop: string) {
  const { db } = getAdminServices();
  const ref = db.collection('shopifyOAuthStates').doc(nonce);
  const snap = await ref.get();
  if (!snap.exists) return false;
  const data = snap.data() ?? {};
  if (data.uid !== uid || data.shop !== shop || typeof data.expiresAt !== 'number' || Date.now() > data.expiresAt) {
    await ref.delete();
    return false;
  }
  await ref.delete();
  return true;
}
