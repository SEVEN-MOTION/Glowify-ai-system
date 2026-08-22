// packages/ai/actions/executor.ts
import Resend from 'resend';
import { logger } from '../services/observability';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function executeAutomation(tenantId: string, action: { id: string, type: string, payload: any, estimatedRevenue?: number }) {
  const startTime = Date.now();
  try {
    switch (action.type) {
      case 'SEND_EMAIL':
        await resend.emails.send({
          from: 'Glowify <hello@glowify.ai>',
          to: action.payload.email,
          subject: action.payload.subject,
          html: action.payload.content
        });
        break;
      case 'ADJUST_AD_BUDGET':
        logger.info('ai.execution', 'Adjusting ads', { tenantId, metadata: { actionId: action.id, payload: action.payload } });
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }

    const durationMs = Date.now() - startTime;
    await logger.trackAIAction({
      tenantId,
      actionType:        action.type,
      success:           true,
      durationMs,
      revenueAttributed: action.estimatedRevenue || 0,
      metadata:          { actionId: action.id },
    });
  } catch (err: any) {
    logger.error('ai.execution', `Execution failed: ${action.type}`, err, { tenantId, metadata: { actionId: action.id } });
    await logger.trackAIAction({
      tenantId,
      actionType:   action.type,
      success:      false,
      durationMs:   Date.now() - startTime,
      errorMessage: err.message,
      metadata:     { actionId: action.id },
    });
    throw err;
  }
}
