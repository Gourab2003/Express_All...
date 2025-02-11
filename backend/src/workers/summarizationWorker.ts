import { Worker, Job, WorkerOptions } from "bullmq";
import { redis } from "../lib/redis";
import { pipeline } from "@xenova/transformers";
import { logger } from "../utils/logger";
import Post from "../models/Blog.Schema";
import { APIError } from "../utils/errorHandler";



class SummarizerWorker {
    private worker!: Worker; // Use definite assignment assertion
    private summarizationPipeline: any;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            logger.info('Initializing summarization pipeline...');
            this.summarizationPipeline = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6');

            const workerOptions: WorkerOptions = {
                connection: redis,
                concurrency: 1,
                removeOnComplete: {
                    count: 1000
                },
                removeOnFail: {
                    count: 5000
                }
            };

            this.worker = new Worker(
                'post-summarization',
                async (job: Job) => {
                    logger.info(`Processing summarization job ${job.id}`);
                    const { postId, content } = job.data;

                    if (!content) {
                        throw new APIError(`Job ${job.id} is missing content.`, 400);
                    }

                    try {
                        const summaryResult = await this.summarizationPipeline(content, {
                            max_length: 100,
                            min_length: 50,
                            do_sample: false
                        });

                        const summary = (summaryResult as any)[0]?.summary_text || 'No summary generated.';

                        // Update the post with the generated summary
                        await Post.updateWithSummary(postId, summary);

                        logger.info(`Successfully generated summary for post ${postId}`);
                        return { summary, postId };
                    } catch (error) {
                        logger.error(`Summarization failed for job ${job.id}:`, error);
                        throw error;
                    }
                },
                workerOptions
            );

            this.setupEventListeners();
        } catch (error) {
            logger.error('Worker initialization failed:', error);
            throw error;
        }
    }

    private setupEventListeners() {
        if (!this.worker) return;

        this.worker.on('completed', (job) => {
            console.log(`✅ Job ${job.id} completed successfully.`);
        });

        this.worker.on('failed', (job, err) => {
            console.error(`❌ Job ${job?.id} failed:`, err);
        });

        this.worker.on('error', (err) => {
            console.error('⚠️ Worker error:', err);
        });
    }

    public async shutdown() {
        console.log('🛑 Gracefully shutting down worker...');
        if (this.worker) {
            await this.worker.close();
        }
    }
}

const worker = new SummarizerWorker();
console.log('🚀 AI Worker is running...');

// Handle process termination
process.on('SIGTERM', async () => {
    console.log('SIGTERM received');
    await worker.shutdown();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received');
    await worker.shutdown();
    process.exit(0);
});

export default worker;