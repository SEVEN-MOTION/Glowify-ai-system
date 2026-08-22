// packages/worker/handlers/event-handler.ts
import { analyzeBusinessData } from '@/packages/ai/agents/analyzer';
import { executeAutomation } from '@/packages/ai/actions/executor';
import { prisma } from '@/packages/database/client';

export async function processShopifyEvent(event: any) {
  // 1. Log event
  await prisma.automationLog.create({ data: { action: 'RECEIVE_SHOPIFY_EVENT', metadata: event } });

  // 2. Fetch context/relevant data for the tenant
  const businessData = event;

  // 3. AI Analysis
  const insights = await analyzeBusinessData(event.tenant_id, businessData);

  // 4. Execution Loop
  for (const insight of insights) {
    const savedInsight = await prisma.aIInsight.create({ data: { ...insight, tenantId: event.tenant_id } });
    
    // Auto-execute if priority is critical
    if (insight.priority <= 2) {
      await executeAutomation(event.tenant_id, savedInsight.automationAction as any);
    }
  }
}
