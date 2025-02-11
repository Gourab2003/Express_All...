import { logger } from '../utils/logger';
import { redis } from '../lib/redis';
import { Queue, QueueEvents, JobsOptions, Job } from 'bullmq';


// Queue Metrics Interface
interface QueueMetrics {
    processedCount: number;
    failedCount: number;
    activeCount: number;
    waitingCount: number;
    lastProcessingTime: number;
}

export class QueueMonitor {
    private queue: Queue;
    private queueEvents: QueueEvents;
    private metrics: QueueMetrics;

    constructor(queue: Queue) {
        if (!queue) {
            throw new Error('Queue instance is required to initialize QueueMonitor.');
        }

        this.queue = queue;
        this.queueEvents = new QueueEvents(queue.name, { connection: redis });

        this.metrics = {
            processedCount: 0,
            failedCount: 0,
            activeCount: 0,
            waitingCount: 0,
            lastProcessingTime: 0
        };

        this.initialize();
    }

    private initialize() {
        // Monitor job completion
        this.queueEvents.on('completed', async ({ jobId }) => {
            try {
                const job: Job | null = await this.queue.getJob(jobId);
                if (job) {
                    const finishedOn = job.finishedOn || Date.now();
                    const processedOn = job.processedOn || finishedOn; // Estimate if not available
                    this.metrics.processedCount++;
                    this.metrics.lastProcessingTime = finishedOn - processedOn;

                    logger.info({
                        event: 'job_completed',
                        jobId,
                        processingTime: this.metrics.lastProcessingTime,
                        returnValue: job.returnvalue || null
                    });
                }
            } catch (error) {
                logger.error(`Error handling job completion event: ${error}`);
            }
        });

        // Monitor job failures
        this.queueEvents.on('failed', async ({ jobId, failedReason }) => {
            try {
                this.metrics.failedCount++;

                logger.error({
                    event: 'job_failed',
                    jobId,
                    reason: failedReason
                });
            } catch (error) {
                logger.error(`Error handling job failed event: ${error}`);
            }
        });

        // Periodically update queue metrics
        setInterval(async () => {
            try {
                const [waiting, active] = await Promise.all([
                    this.queue.getWaitingCount(),
                    this.queue.getActiveCount()
                ]);

                this.metrics.waitingCount = waiting;
                this.metrics.activeCount = active;

                logger.info({
                    event: 'queue_metrics',
                    metrics: this.metrics
                });
            } catch (error) {
                logger.error(`Failed to update queue metrics: ${error}`);
            }
        }, 60000);
    }

    // Get current queue health status
    public async getHealth(): Promise<{
        status: 'healthy' | 'degraded' | 'unhealthy';
        metrics: QueueMetrics;
    }> {
        try {
            const isRedisConnected = redis.status === 'ready';
            const failureRate = this.metrics.processedCount
                ? this.metrics.failedCount / this.metrics.processedCount
                : 0;

            return {
                status: this.determineHealth(isRedisConnected, failureRate),
                metrics: { ...this.metrics }
            };
        } catch (error) {
            logger.error(`Health check failed: ${error}`);
            return {
                status: 'unhealthy',
                metrics: { ...this.metrics }
            };
        }
    }

    private determineHealth(isRedisConnected: boolean, failureRate: number): 'healthy' | 'degraded' | 'unhealthy' {
        if (!isRedisConnected) return 'unhealthy';
        if (failureRate > 0.1) return 'degraded';
        return 'healthy';
    }
}
