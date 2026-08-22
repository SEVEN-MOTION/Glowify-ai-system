import { createOAuthState, getShopifyConfig, normalizeShopDomain, verifyBearer } from './_lib/oauth.js';

type ApiRequest = { method?: string; headers: Record<string, string | string[] | undefined>; body?: unknown; query?: Record<string, string | string[] | undefined> };
type ApiResponse = { status: (code: number) => ApiResponse; json: (body: unknown) => unknown; setHeader: (name: string, value: string) => void };

function json(res: ApiResponse, status: number, body: unknown) { return res.status(status).json(body); }

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  const config = getShopifyConfig();
  if (!config) return json(res, 503, { error: 'Shopify OAuth is not configured' });

  let user;
  try {
    user = await verifyBearer(req);
  } catch {
    return json(res, 503, { error: 'Authentication service is not configured' });
  }
  if (!user) return json(res, 401, { error: 'Authentication required' });

  let body: unknown;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; } catch { return json(res, 400, { error: 'Invalid JSON body' }); }
  const shop = normalizeShopDomain(body && typeof body === 'object' ? (body as { shop?: string }).shop : undefined);
  if (!shop) return json(res, 400, { error: 'A valid shop domain such as your-store.myshopify.com is required' });

  try {
    const state = await createOAuthState(user.uid, shop);
    const redirectUri = `${config.appUrl}/api/shopify/callback`;
    const url = new URL(`https://${shop}/admin/oauth/authorize`);
    url.searchParams.set('client_id', config.clientId);
    url.searchParams.set('scope', config.scopes);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('state', state);

    return json(res, 200, { authorizationUrl: url.toString(), shop, redirectUri });
  } catch (error) {
    console.error('Shopify OAuth start failed', error);
    return json(res, 502, { error: 'Unable to start Shopify connection' });
  }
}
