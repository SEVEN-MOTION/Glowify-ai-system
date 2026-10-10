import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  verifyIdToken: vi.fn(),
  getStore: vi.fn(),
  generateContent: vi.fn(),
  getAdminServices: vi.fn(),
}));

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: { generateContent: mocks.generateContent },
  })),
}));

vi.mock('../../packages/worker/firebase-admin.js', () => ({
  getAdminServices: mocks.getAdminServices,
}));

import handler from './analyze';

type MockResponse = {
  statusCode: number;
  body: unknown;
  headers: Record<string, string>;
  status(code: number): MockResponse;
  json(body: unknown): unknown;
  setHeader(name: string, value: string): void;
};

function makeResponse(): MockResponse {
  const res: MockResponse = {
    statusCode: 200,
    body: undefined,
    headers: {},
    status(code) {
      res.statusCode = code;
      return res;
    },
    json(body) {
      res.body = body;
      return body;
    },
    setHeader(name, value) {
      res.headers[name] = value;
    },
  };
  return res;
}

function makeRequest(token?: string, body: unknown = { storeId: 'store-1', eventData: { sales: 3 } }) {
  return {
    method: 'POST',
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body,
  };
}

function configureStore(ownerUid = 'user-1') {
  mocks.getStore.mockResolvedValue({
    exists: true,
    data: () => ({ owner_uid: ownerUid }),
  });
  mocks.getAdminServices.mockReturnValue({
    adminAuth: { verifyIdToken: mocks.verifyIdToken },
    db: {
      collection: () => ({
        doc: () => ({ get: mocks.getStore }),
      }),
    },
  });
}

describe('POST /api/ai/analyze authentication boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('GEMINI_API_KEY', 'test-key-not-a-real-secret');
    vi.stubEnv('GEMINI_MODEL', 'test-model');
    configureStore();
    mocks.verifyIdToken.mockResolvedValue({ uid: 'user-1' });
    mocks.generateContent.mockResolvedValue({ text: '{"summary":"ok"}' });
  });

  it('rejects a request without a Bearer token before checking the store', async () => {
    const res = makeResponse();

    await handler(makeRequest() as never, res as never);

    expect(res.statusCode).toBe(401);
    expect(mocks.verifyIdToken).not.toHaveBeenCalled();
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });

  it('uses revocation-aware Firebase token verification and rejects invalid or revoked tokens', async () => {
    mocks.verifyIdToken.mockRejectedValueOnce(new Error('token rejected'));
    const res = makeResponse();

    await handler(makeRequest('bad-token') as never, res as never);

    expect(mocks.verifyIdToken).toHaveBeenCalledWith('bad-token', true);
    expect(res.statusCode).toBe(401);
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });

  it('allows the verified owner of the requested store', async () => {
    const res = makeResponse();

    await handler(makeRequest('valid-token') as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(mocks.verifyIdToken).toHaveBeenCalledWith('valid-token', true);
    expect(mocks.generateContent).toHaveBeenCalledOnce();
  });

  it('denies a verified user who does not own the requested store', async () => {
    mocks.verifyIdToken.mockResolvedValueOnce({ uid: 'user-2' });
    const res = makeResponse();

    await handler(makeRequest('valid-token') as never, res as never);

    expect(res.statusCode).toBe(403);
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });

  it('allows cross-store access only when the verified token has a server-controlled admin claim', async () => {
    mocks.verifyIdToken.mockResolvedValueOnce({ uid: 'admin-1', admin: true });
    const res = makeResponse();

    await handler(makeRequest('admin-token') as never, res as never);

    expect(res.statusCode).toBe(200);
    expect(mocks.generateContent).toHaveBeenCalledOnce();
  });

  it('fails closed when the store authorization lookup is unavailable', async () => {
    mocks.getStore.mockRejectedValueOnce(new Error('database unavailable'));
    const res = makeResponse();

    await handler(makeRequest('valid-token') as never, res as never);

    expect(res.statusCode).toBe(503);
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });

  it('fails closed when Firebase Admin configuration is unavailable', async () => {
    mocks.getAdminServices.mockImplementationOnce(() => {
      throw new Error('missing server configuration');
    });
    const res = makeResponse();

    await handler(makeRequest('valid-token') as never, res as never);

    expect(res.statusCode).toBe(503);
    expect(mocks.generateContent).not.toHaveBeenCalled();
  });
});
