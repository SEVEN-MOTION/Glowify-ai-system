// packages/ai/queues/insightQueue.ts
import { Queue, Worker } from 'bullmq';
import { analyzeBusinessData } from '../agents/analyzer';
import { executeAutomation } from '../actions/executor';
import { logger } from '../services/observability';
import { prisma } from '../../database/client';

export const insightQueue = new Queue('insight-generation', {
  connection: { host: 'localhost', port: 6379 }
});

export const worker = new Worker('insight-generation', async job => {
  const { tenantId, eventData } = job.data;

  // 1. AI Analysis with learning context
  const insights = await analyzeBusinessData(tenantId, eventData);
  logger.info('ai.analysis', 'AI insights generated', { tenantId, jobId: job.id?.toString(), metadata: { count: insights.length, status: 'SUCCESS' } });

  // 2. Persist & Trigger Actions
  for (const insight of insights) {
    try {
      const result = await executeAutomation(tenantId, insight.automationAction);
      // Log execution WITH expected outcome for the feedback loop
      await prisma.executionTrace.create({
        data: {
          tenantId,
          eventType: insight.automationAction.type,
          payload: { action: insight.automationAction, result },
          status: 'SUCCESS',
          relatedId: job.id?.toString(),
          expectedOutcome: insight.expectedOutcome,
          evaluationStatus: 'pending'
        }
      });
    } catch (error: any) {
      logger.error('ai.execution', 'Execution failed', error as Error, { tenantId, jobId: job.id?.toString(), metadata: { actionType: insight.automationAction.type } });
    }
  }
}, { connection: { host: 'localhost', port: 6379 } });

