import { GoogleGenAI } from '@google/genai';
import { getAdminServices } from '../../packages/worker/firebase-admin.js';

type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
};

type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => unknown;
  setHeader: (name: string, value: string) => void;
};

function json(res: ApiResponse, status: number, body: unknown) {
  return res.status(status).json(body);
}

function getBearerToken(req: ApiRequest): string | null {
  const header = req.headers.authorization;
  if (Array.isArray(header) || !header?.startsWith('Bearer ')) return null;
  return header.slice(7).trim() || null;
}

async function requireStoreAccess(req: ApiRequest, storeId: string) {
  const token = getBearerToken(req);
  if (!token) return { status: 401 as const, error: 'Authentication required' };
  if (!storeId) return { status: 400 as const, error: 'storeId is required' };

  let adminAuth;
  let db;
  try {
    ({ adminAuth, db } = getAdminServices());
  } catch {
    return { status: 503 as const, error: 'Authentication service is not configured' };
  }

  let decodedToken;
  try {
    // Revocation-aware verification is intentional for this privileged, billable endpoint.
    decodedToken = await adminAuth.verifyIdToken(token, true);
  } catch {
    return { status: 401 as const, error: 'Authentication required' };
  }

  let store;
  try {
    store = await db.collection('stores').doc(storeId).get();
  } catch {
    // Authorization must fail closed when ownership cannot be established.
    return { status: 503 as const, error: 'Store authorization is temporarily unavailable' };
  }

  if (!store.exists) {
    return { status: 404 as const, error: 'Store not found' };
  }

  const data = store.data() ?? {};
  const ownerUid = data.owner_uid ?? data.ownerUid ?? data.user_id ?? data.userId;

  // Firebase custom claims are server-controlled. Unlike email equality, an explicit
  // admin claim can be granted and revoked by trusted administrative code only.
  const isServerAuthorizedAdmin = decodedToken.admin === true;
  if (!isServerAuthorizedAdmin && ownerUid !== decodedToken.uid) {
    return { status: 403 as const, error: 'Forbidden' };
  }

  return { decodedToken };
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return json(res, 503, { error: 'AI service is not configured' });
  }

  let body: unknown;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  } catch {
    return json(res, 400, { error: 'Invalid JSON body' });
  }

  if (!body || typeof body !== 'object') {
    return json(res, 400, { error: 'Request body must be an object' });
  }

  const { storeId, eventData } = body as { storeId?: string; eventData?: unknown };
  if (!eventData) {
    return json(res, 400, { error: 'eventData is required' });
  }

  const auth = await requireStoreAccess(req, storeId ?? '');
  if ('status' in auth) {
    return json(res, auth.status, { error: auth.error });
  }

  try {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model,
      contents: `You are Glowify AI, an assistant for a beauty and commerce SaaS platform. Analyze the supplied business event data and return concise, actionable insights for the store operator. Do not invent facts. Return valid JSON with keys: summary, insights, recommendedActions. Event data: ${JSON.stringify(eventData)}`,
    });

    return json(res, 200, {
      success: true,
      storeId,
      analysis: response.text ?? '',
      model,
    });
  } catch (error) {
    console.error('Glowify AI analysis failed', error);
    return json(res, 502, { error: 'AI analysis failed' });
  }
}
