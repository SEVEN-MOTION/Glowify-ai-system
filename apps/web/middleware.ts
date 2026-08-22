import { NextRequest, NextResponse } from 'next/server';
// Firebase Admin SDK should be used for server-side verification
import { getAuth } from 'firebase-admin/auth';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp({
    credential: cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!)),
  });
}

// Middleware to protect routes and verify Firebase session
export async function middleware(req: any) {
  // Define public paths that don't require authentication
  const isPublicPath = req.nextUrl.pathname.startsWith('/login') || 
                       req.nextUrl.pathname.startsWith('/public') ||
                       req.nextUrl.pathname === '/';

  // 1. Get session token from headers (Authorization: Bearer <token>)
  const authHeader = req.headers.get('Authorization');
  
  if (!authHeader) {
    if (isPublicPath) return (NextResponse as any).next();
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    // 2. Verify Firebase Auth token
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // 3. Inject user context into headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set('x-user-uid', decodedToken.uid);

    return (NextResponse as any).next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error('Error verifying Firebase token:', error);
    // Token invalid or expired, reject the request
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}

/**
 * Authenticates an incoming request using the API key in the headers.
 */
export async function authenticateRequest(req: any) {
  const apiKey = req.headers.get('x-api-key');
  if (!apiKey) return null;

  try {
    const { prisma } = await import('../../packages/database/client');
    const apiKeyDoc = await (prisma as any).aPIKey.findUnique({
      where: { key: apiKey },
      include: { tenant: true },
    });
    return apiKeyDoc;
  } catch (error) {
    console.error('Error authenticating request via API key:', error);
    return null;
  }
}

/**
 * Enforces Safe Mode restrictions by blocking certain paths.
 */
export function enforceSafeMode(safeMode: boolean, path: string) {
  if (safeMode && (path.startsWith('/api/execute') || path.includes('/execute'))) {
    throw new Error('SAFE_MODE_BLOCK');
  }
}
