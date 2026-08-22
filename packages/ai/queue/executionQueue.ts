import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: null,
});

// Configure queue with priority and rate limiting options
export const executionQueue = new Queue('insight-execution', { 
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
  }
});

// Helper for per-tenant rate limiting
export const getRateLimiter = (tenantId: string) => ({
  max: 10, // Max executions per minute
  duration: 60000,
  keyPrefix: `rate-limit:${tenantId}`
});
