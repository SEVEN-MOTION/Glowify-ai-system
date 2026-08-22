import { NextResponse } from 'next/server'
import { logger } from '@/packages/ai/services/observability'

export async function GET() {
  return NextResponse.json({
    status:    'operational',
    logging:   'structured — JSON in production, colored in development',
    tracing:   'span-based performance tracking active',
    alerting:  process.env.SLACK_ALERT_WEBHOOK ? 'slack alerts configured' : 'no alerts configured',
    timestamp:  new Date().toISOString(),
  })
}
