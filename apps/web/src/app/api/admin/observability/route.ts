import { NextResponse } from 'next/server'
import { logger } from '@/packages/ai/services/observability'
import { requireAdmin } from '@/lib/server-auth'

export async function GET(req: Request) {
  const auth = await requireAdmin(req)
  if ('response' in auth) return auth.response

  return NextResponse.json({
    status:    'operational',
    logging:   'structured — JSON in production, colored in development',
    tracing:   'span-based performance tracking active',
    alerting:  process.env.SLACK_ALERT_WEBHOOK ? 'slack alerts configured' : 'no alerts configured',
    timestamp: new Date().toISOString(),
  })
}
