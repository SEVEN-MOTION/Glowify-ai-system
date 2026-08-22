import crypto from 'crypto';
import { consumeOAuthState, encryptAccessToken, getShopifyConfig, normalizeShopDomain, verifyState } from './_lib/oauth.js';
import { getAdminServices } from '../../packages/worker/firebase-admin.js';

type ApiRequest = { method?: string; headers: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> };
type ApiResponse = { status: (code: number) => ApiResponse; json: (body: unknown) => unknown; setHeader: (name: string, value: string) => void; redirect?: (status: number, url: string) => unknown };

function getParam(req: ApiRequest, key: string) {
  const value = req.query?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function safeRedirect(res: ApiResponse, path: string) {
  if (res.redirect) return res.redirect(302, path);
  res.setHeader('Location', path);
  return res.status(302).json({ redirect: path });
}

function verifyShopifyHmac(req: ApiRequest, secret: string) {
  const hmac = getParam(req, 'hmac');
  if (!hmac) return false;
  const pairs = Object.entries(req.query ?? {})
    .filter(([key]) => key !== 'hmac' && key !== 'signature')
    .map(([key, value]) => `${key}=${Array.isArray(value) ? value[0] : value ?? ''}`)
    .sort()
    .join('&');
  const digest = crypto.createHmac('sha256', secret).update(pairs).digest('hex');
  if (digest.length !== hmac.length) return false;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const config = getShopifyConfig();
  const appUrl = config?.appUrl || 'https://glowify-ai-system.vercel.app';
  if (!config) return safeRedirect(res, `${appUrl}/?shopify=error&reason=not_configured`);

  const shop = normalizeShopDomain(getParam(req, 'shop'));
  const code = getParam(req, 'code');
  const stateValue = getParam(req, 'state');
  if (!shop || !code || !stateValue) return safeRedirect(res, `${appUrl}/?shopify=error&reason=invalid_callback`);

  let state;
  try { state = verifyState(stateValue); } catch { state = null; }
  if (!state || state.shop !== shop) return safeRedirect(res, `${appUrl}/?shopify=error&reason=invalid_state`);
  if (!verifyShopifyHmac(req, config.clientSecret)) return safeRedirect(res, `${appUrl}/?shopify=error&reason=invalid_hmac`);

  try {
    const consumed = await consumeOAuthState(state.nonce, state.uid, shop);
    if (!consumed) return safeRedirect(res, `${appUrl}/?shopify=error&reason=state_expired`);

    const tokenResponse = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id: config.clientId, client_secret: config.clientSecret, code }),
    });

    if (!tokenResponse.ok) {
      console.error('Shopify token exchange failed', tokenResponse.status);
      return safeRedirect(res, `${appUrl}/?shopify=error&reason=token_exchange`);
    }

    const tokenData = await tokenResponse.json() as { access_token?: string; scope?: string };
    if (!tokenData.access_token) return safeRedirect(res, `${appUrl}/?shopify=error&reason=missing_token`);

    const encryptedAccessToken = encryptAccessToken(tokenData.access_token);
    const { db } = getAdminServices();
    const storeRef = db.collection('stores').doc(shop);
    await storeRef.set({
      owner_uid: state.uid,
      shopifyDomain: shop,
      shopifyConnected: true,
      shopifyScopes: tokenData.scope || config.scopes,
      shopifyAccessToken: encryptedAccessToken,
      updatedAt: new Date(),
    }, { merge: true });

    await db.collection('shopifyConnections').doc(shop).set({
      owner_uid: state.uid,
      shopifyDomain: shop,
      scopes: tokenData.scope || config.scopes,
      encryptedAccessToken,
      connectedAt: new Date(),
      updatedAt: new Date(),
    }, { merge: true });

    return safeRedirect(res, `${appUrl}/?shopify=connected&shop=${encodeURIComponent(shop)}`);
  } catch (error) {
    console.error('Shopify OAuth callback failed', error);
    return safeRedirect(res, `${appUrl}/?shopify=error&reason=server_error`);
  }
}
