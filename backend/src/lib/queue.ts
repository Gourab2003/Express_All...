import { Queue } from "bullmq";
import {redis} from "./redis";

class PostQueue {
    private static instance: Queue;
    private static readonly queueName = 'post-summarization';

    private constructor(){};

    public static getInstance(): Queue {
        if(!PostQueue.instance){
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

    public static async addSummarizationJob(postId: string, content: string): Promise<void>{
        if(!postId || !content){
            throw new Error("PostId or Content are required")
        }
       try {
         const queue = PostQueue.getInstance();
         await queue.add('summarize-post', {postId, content}, {
             jobId: `summarize-${postId}`,
             priority: 1,
             timestamp: 30000, //30sec timeout
         });
       } catch (error) {
           console.error('Failed to add summarization job:', error);
           throw new Error('Failed to queue summarization job');
       }
       
    }

    public static async cleanup(): Promise<void>{
        if(PostQueue.instance){
            await PostQueue.instance.close();
        }
    }
}

export const summarizationQueue = PostQueue.getInstance();
export const addSummarizationJob = PostQueue.addSummarizationJob;
export const cleanup = PostQueue.cleanup;


