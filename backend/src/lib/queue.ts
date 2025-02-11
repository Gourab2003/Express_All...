import { Queue } from "bullmq";
import { redis } from "./redis";
import { logger } from "../utils/logger";

class PostQueue {
    private static instance: Queue;
    private static readonly queueName = 'post-summarization';

    private constructor() { };

    public static getInstance(): Queue {
        if (!PostQueue.instance) {
            PostQueue.instance = new Queue(PostQueue.queueName, {
                connection: redis,
                defaultJobOptions: {
                    attempts: 3,
                    backoff: { type: 'exponential', delay: 5000 },
                    removeOnComplete: true,
                    removeOnFail: 100,
                }
            });
        }
        return PostQueue.instance;
    }

    public static async addSummarizationJob(postId: string, content: string): Promise<void> {
        if (!postId || !content) {
            logger.error('Missing required parameters for summarization job');
            throw new Error("PostId and Content are required");
        }

        try {
            const queue = PostQueue.getInstance();
            await queue.add('summarize-post', { postId, content }, {
                jobId: `summarize-${postId}`,
                priority: 1,
                timestamp: 30000, // 30sec timeout
            });
            logger.info(`Added summarization job for post ${postId}`);
        } catch (error) {
            logger.error('Failed to add summarization job:', error);
            throw new Error('Failed to queue summarization job');
        }
    }


    public static async cleanup(): Promise<void> {
        if (PostQueue.instance) {
            logger.info('Cleaning up post queue...');
            await PostQueue.instance.close();
        }
    }

}

export const summarizationQueue = PostQueue.getInstance();
export const addSummarizationJob = PostQueue.addSummarizationJob;
export const cleanup = PostQueue.cleanup;


