import { NextResponse } from 'next/server'
import { getQueueHealth } from '@/packages/worker/queue/ai-queue'

export async function GET() {
  try {
    const health = await getQueueHealth()
    const totalFailed  = Object.values(health).reduce((acc: number, q: any) => acc + (q.failed  || 0), 0)
    const totalActive  = Object.values(health).reduce((acc: number, q: any) => acc + (q.active  || 0), 0)
    const totalWaiting = Object.values(health).reduce((acc: number, q: any) => acc + (q.waiting || 0), 0)
    return NextResponse.json({
      status:  totalFailed > 50 ? 'degraded' : 'healthy',
      queues:  health,
      summary: { totalFailed, totalActive, totalWaiting },
      timestamp: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 })
  }
}
