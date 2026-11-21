import { getAdminServices } from '../../packages/worker/firebase-admin.js';
import { decryptAccessToken, normalizeShopDomain } from './_lib/oauth.js';

type ApiRequest = { method?: string; headers: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined> };
type ApiResponse = { status: (code: number) => ApiResponse; json: (body: unknown) => unknown; setHeader: (name: string, value: string) => void };

const API_VERSION = '2026-10';
const OVERVIEW_QUERY = `
  query Overview($ordersQuery: String!) {
    shop { name currencyCode }
    productsCount { count precision }
    ordersCount(query: $ordersQuery, limit: 10000) { count precision }
    orders(first: 250, query: $ordersQuery, sortKey: CREATED_AT, reverse: true) {
      edges {
        node {
          createdAt
          currentTotalPriceSet { shopMoney { amount currencyCode } }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

function json(res: ApiResponse, status: number, body: unknown) {
  res.setHeader('Cache-Control', 'private, no-store');
  return res.status(status).json(body);
}

function getBearer(req: ApiRequest) {
  const value = req.headers.authorization;
  if (Array.isArray(value) || !value?.startsWith('Bearer ')) return null;
  return value.slice(7).trim() || null;
}

function asDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate?: unknown }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return json(res, 405, { error: 'Method not allowed' });
  }

  const bearer = getBearer(req);
  if (!bearer) return json(res, 401, { error: 'Authentication required' });

  let adminAuth;
  let db;
  try {
    ({ adminAuth, db } = getAdminServices());
  } catch {
    return json(res, 503, { error: 'Store service is not configured' });
  }

  let user;
  try {
    user = await adminAuth.verifyIdToken(bearer, true);
  } catch {
    return json(res, 401, { error: 'Authentication required' });
  }

  let snapshots;
  try {
    snapshots = await db.collection('shopifyConnections').where('owner_uid', '==', user.uid).limit(20).get();
  } catch {
    return json(res, 503, { error: 'Store connection status is temporarily unavailable' });
  }

  const connections = snapshots.docs
    .map((snapshot: { id: string; data: () => Record<string, unknown> }) => {
      const record = snapshot.data();
      const domain = normalizeShopDomain(typeof record.shopifyDomain === 'string' ? record.shopifyDomain : snapshot.id);
      if (!domain || typeof record.encryptedAccessToken !== 'string') return null;
      return {
        domain,
        name: typeof record.shopName === 'string' ? record.shopName : domain.replace(/\.myshopify\.com$/, '').replace(/-/g, ' '),
        connectedAt: asDate(record.connectedAt)?.toISOString() ?? null,
        scopes: typeof record.scopes === 'string' ? record.scopes.split(',').map(scope => scope.trim()).filter(Boolean) : [],
        encryptedAccessToken: record.encryptedAccessToken,
      };
    })
    .filter((connection): connection is NonNullable<typeof connection> => Boolean(connection))
    .sort((a, b) => (b.connectedAt || '').localeCompare(a.connectedAt || ''));

  if (!connections.length) return json(res, 200, { status: 'not_connected' });

  const requestedShopValue = req.query?.shop;
  const requestedShop = normalizeShopDomain(Array.isArray(requestedShopValue) ? requestedShopValue[0] : requestedShopValue);
  const selected = requestedShop ? connections.find(connection => connection.domain === requestedShop) : connections[0];
  if (requestedShop && !selected) return json(res, 403, { error: 'This store is not connected to your account' });

  let accessToken: string;
  try {
    accessToken = decryptAccessToken(selected.encryptedAccessToken);
  } catch {
    return json(res, 503, { status: 'connection_unavailable', store: { domain: selected.domain } });
  }

  const now = new Date();
  const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const searchDate = start.toISOString().slice(0, 10);
  const graphqlResponse = await fetch(`https://${selected.domain}/admin/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': accessToken },
    body: JSON.stringify({ query: OVERVIEW_QUERY, variables: { ordersQuery: `created_at:>=${searchDate} financial_status:paid` } }),
  }).catch(() => null);

  if (!graphqlResponse) return json(res, 502, { status: 'temporarily_unavailable', store: { domain: selected.domain } });
  if (graphqlResponse.status === 401 || graphqlResponse.status === 403) {
    return json(res, 200, { status: 'reconnect_required', store: { domain: selected.domain } });
  }
  if (!graphqlResponse.ok) return json(res, 502, { status: 'temporarily_unavailable', store: { domain: selected.domain } });

  const payload = await graphqlResponse.json().catch(() => null) as {
    errors?: unknown[];
    data?: {
      shop?: { name?: string; currencyCode?: string };
      productsCount?: { count?: number; precision?: string };
      ordersCount?: { count?: number; precision?: string };
      orders?: { edges?: Array<{ node?: { createdAt?: string; currentTotalPriceSet?: { shopMoney?: { amount?: string; currencyCode?: string } } } }>; pageInfo?: { hasNextPage?: boolean } };
    };
  } | null;
  if (!payload?.data || payload.errors?.length) return json(res, 502, { status: 'temporarily_unavailable', store: { domain: selected.domain } });

  const orders = payload.data.orders?.edges ?? [];
  const orderCount = payload.data.ordersCount;
  const productsCount = payload.data.productsCount;
  const historyComplete = payload.data.orders?.pageInfo?.hasNextPage !== true
    && orderCount?.precision === 'EXACT'
    && typeof orderCount.count === 'number'
    && orderCount.count === orders.length;

  let salesTotal = 0;
  const byDay = new Map<string, number>();
  for (const edge of orders) {
    const order = edge.node;
    const amount = Number(order?.currentTotalPriceSet?.shopMoney?.amount);
    const date = order?.createdAt?.slice(0, 10);
    if (!Number.isFinite(amount) || !date) continue;
    salesTotal += amount;
    byDay.set(date, (byDay.get(date) ?? 0) + amount);
  }

  const currency = payload.data.shop?.currencyCode || orders[0]?.node?.currentTotalPriceSet?.shopMoney?.currencyCode || null;
  return json(res, 200, {
    status: 'connected',
    store: { domain: selected.domain, name: payload.data.shop?.name || selected.name, connectedAt: selected.connectedAt },
    summary: {
      periodStart: start.toISOString(),
      periodEnd: now.toISOString(),
      currency,
      paidOrderCount: orderCount?.precision === 'EXACT' ? orderCount.count : null,
      productsCount: productsCount?.precision === 'EXACT' ? productsCount.count : null,
      paidSalesTotal: historyComplete ? salesTotal : null,
      averageOrderValue: historyComplete && orders.length ? salesTotal / orders.length : null,
      salesByDay: historyComplete ? [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([day, sales]) => ({ day, sales })) : [],
      historyComplete,
    },
    source: 'Shopify Admin GraphQL API',
    syncedAt: now.toISOString(),
  });
}
