import { NextResponse } from 'next/server'
import { adminAuth, db } from '@/lib/firebase-admin'

const FOUNDER_EMAIL = 'glowifybabystores@gmail.com'

function getBearerToken(req: Request): string | null {
  const header = req.headers.get('authorization')
  if (!header?.startsWith('Bearer ')) return null
  return header.slice(7).trim() || null
}

export async function authenticateApiRequest(req: Request) {
  const token = getBearerToken(req)
  if (!token) return null

  try {
    return await adminAuth.verifyIdToken(token)
  } catch {
    return null
  }
}

export async function requireAdmin(req: Request) {
  const decodedToken = await authenticateApiRequest(req)
  if (!decodedToken) {
    return { response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }

  if (decodedToken.email === FOUNDER_EMAIL) {
    return { decodedToken }
  }

  const profile = await db.collection('users').doc(decodedToken.uid).get()
  const role = profile.exists ? profile.data()?.role : undefined

  if (role === 'owner' || role === 'admin') {
    return { decodedToken }
  }

  return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
}

export async function requireStoreAccess(req: Request, storeId: string) {
  const decodedToken = await authenticateApiRequest(req)
  if (!decodedToken) {
    return { response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) }
  }

  if (!storeId) {
    return { response: NextResponse.json({ error: 'storeId is required' }, { status: 400 }) }
  }

  // The founder is the platform owner and may operate across stores.
  if (decodedToken.email === FOUNDER_EMAIL) {
    return { decodedToken }
  }

  const store = await db.collection('stores').doc(storeId).get()
  if (!store.exists) {
    return { response: NextResponse.json({ error: 'Store not found' }, { status: 404 }) }
  }

  const data = store.data() ?? {}
  const ownerUid = data.owner_uid ?? data.ownerUid ?? data.user_id ?? data.userId

  if (ownerUid !== decodedToken.uid) {
    return { response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { decodedToken }
}
