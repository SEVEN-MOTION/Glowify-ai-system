import { prisma } from '../../database/client';
import { logger } from './observability';

export interface EvaluationResult {
  actualOutcome: any;
  revenueImpact: number;
  successScore: number;
}

/**
 * Updates an execution trace with the actual Shopify outcome.
 */
export async function updateTraceWithOutcome(
  traceId: string, 
  outcome: { 
    shopifyOrderId: string; 
    status: string; 
    revenue: number 
  }
) {
  const successScore = outcome.status === 'paid' ? 1.0 : 0.0;

  return await prisma.executionTrace.update({
    where: { id: traceId },
    data: {
      shopifyOrderId: outcome.shopifyOrderId,
      orderStatus: outcome.status,
      actualRevenue: outcome.revenue,
      successScore: successScore,
      evaluationStatus: 'COMPLETED'
    }
  });
}

/**
 * Calculates attributed revenue and attribution confidence based on conversion windows.
 */
export async function calculateAttribution(
  tenantId: string,
  traceId: string,
  actionTimestamp: Date,
  order: { id: string; amount: number; createdAt: Date }
) {
  const timeDiffHours = (order.createdAt.getTime() - actionTimestamp.getTime()) / (1000 * 60 * 60);
  
  let window: '24h' | '72h' | '7d' | null = null;
  let confidence = 0.0;

  if (timeDiffHours <= 24) {
    window = '24h';
    confidence = 0.95;
  } else if (timeDiffHours <= 72) {
    window = '72h';
    confidence = 0.70;
  } else if (timeDiffHours <= 168) {
    window = '7d';
    confidence = 0.40;
  }

  if (window) {
    await prisma.executionTrace.update({
      where: { id: traceId, tenantId },
      data: {
        attributedRevenue: order.amount,
        attributionConfidence: confidence,
        conversionWindow: window,
      }
    });
  }
}

/**
 * AI Evaluation Service
 * Compares AI recommendations with actual results, calculates success score,
 * and determines revenue impact.
 */
export async function evaluateExecution(tenantId: string, executionId: string, result: EvaluationResult) {
  const span = logger.startSpan('ai.evaluation', { tenantId });
  try {
    const updated = await prisma.executionTrace.update({
      where: { id: executionId },
      data: {
        actualOutcome: result.actualOutcome,
        revenueImpact: result.revenueImpact,
        successScore: result.successScore,
        evaluationStatus: 'COMPLETED',
      },
    });

    logger.info('ai.evaluation', `Evaluation complete — $${result.revenueImpact} attributed`, {
      tenantId,
      duration: span.duration,
      metadata: { executionId, revenueImpact: result.revenueImpact },
    });
    logger.endSpan(span, 'completed');
    return updated;
  } catch (err: any) {
    logger.error('ai.evaluation', 'Evaluation failed', err, { tenantId, metadata: { executionId } });
    logger.endSpan(span, 'failed');
    throw err;
  }
}

/**
 * Compares expected vs actual results to calculate success and impact.
 */
export async function calculateMetrics(expected: any, actual: any): Promise<EvaluationResult> {
  // Determine success score (0-1)
  let successScore = 0;
  if (expected && actual) {
    if (expected.targetValue && actual.currentValue) {
      successScore = Math.min(actual.currentValue / expected.targetValue, 1.0);
    } else {
      successScore = actual.success ? 1.0 : 0.0;
    }
  }

  // Determine revenue impact
  const revenueImpact = actual?.revenue || 0;

  return {
    actualOutcome: actual,
    revenueImpact,
    successScore,
  };
}

/**
 * Retrieves the best performing past actions for a tenant to improve future decisions.
 */
export async function getBestPerformingActions(tenantId: string, limit: number = 5) {
  return await prisma.executionTrace.findMany({
    where: {
      tenantId,
      evaluationStatus: 'COMPLETED',
      successScore: { gte: 0.8 }
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: limit
  });
}
