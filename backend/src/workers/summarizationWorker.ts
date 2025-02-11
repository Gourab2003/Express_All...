import { Worker, Job, WorkerOptions } from "bullmq";
import { redis } from "../lib/redis";
import { pipeline } from "@xenova/transformers";

class SummarizerWorker {
    private worker!: Worker; // Use definite assignment assertion
    private summarizationPipeline: any;

    constructor() {
        this.initialize();
    }

    private async initialize() {
        try {
            // Initialize pipeline
            this.summarizationPipeline = await pipeline('summarization', 'Xenova/distilbart-cnn-12-6');

            // Prepare worker options
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

            // Initialize worker
            this.worker = new Worker(
                'post-summarization',
                async (job: Job) => {
                    console.log(`🚀 Processing job ${job.id}...`);
                    const { postId, content } = job.data;

                    if (!content) {
                        throw new Error(`❌ Job ${job.id} is missing content.`);
                    }

                    try {
                        const summaryResult = await this.summarizationPipeline(content, {
                            max_length: 100,
                            min_length: 50,
                            do_sample: false
                        });

                        const summary = (summaryResult as any)[0]?.summary_text || 'No summary generated.';
                        console.log(`✅ Job ${job.id} completed. Summary length: ${summary.length} chars`);

                        return { summary, postId };
                    } catch (error) {
                        console.error(`❌ Job ${job.id} failed:`, error);
                        throw error;
                    }
                },
                workerOptions
            );

            // Setup event listeners
            this.setupEventListeners();

        } catch (error) {
            console.error('Initialization failed:', error);
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