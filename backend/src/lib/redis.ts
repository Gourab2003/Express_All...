import { Redis, RedisOptions } from 'ioredis';
import { config } from '../config/environment';
import { logger } from '../utils/logger';

class RedisConnection {
    private static instance: Redis;
    private static isConnected = false;

    private constructor() { }

    public static getInstance(): Redis {
        if (!RedisConnection.instance) {
            const options: RedisOptions = {
                host: config.REDIS_HOST,
                port: config.REDIS_PORT,
                retryStrategy: (times) => Math.min(times * 100, 3000),
                maxRetriesPerRequest: null, // Allow unlimited retries while connecting
                enableOfflineQueue: true, // Enable command queuing while disconnected
                connectTimeout: 5000,
                lazyConnect: false // Connect immediately
            };

            RedisConnection.instance = new Redis(options);

            RedisConnection.instance
                .on('connect', () => {
                    logger.info('Redis: Connecting...');
                    RedisConnection.isConnected = false;
                })
                .on('ready', () => {
                    logger.info('Redis: Connected');
                    RedisConnection.isConnected = true;
                })
                .on('error', (err) => {
                    logger.error('Redis: Connection error:', err);
                    RedisConnection.isConnected = false;
                })
                .on('end', () => {
                    logger.warn('Redis: Connection closed');
                    RedisConnection.isConnected = false;
                });
        }
        return RedisConnection.instance;
    }

    public static async waitForConnection(timeout = 10000): Promise<void> {
        if (RedisConnection.isConnected) return;

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Redis connection timeout'));
            }, 10000);

            RedisConnection.instance.once('ready', () => {
                clearTimeout(timeout);
                resolve();
            });

            RedisConnection.instance.once('error', (err) => {
                clearTimeout(timeout);
                reject(err);
            });
        });
    }

    public static async checkHealth(): Promise<boolean> {
        try {
            await RedisConnection.instance.ping();
            return true;
        } catch (error) {
            logger.error('Redis connection check failed:', error);
            return false;
        }
    }
    public static getStatus(): string {
        return RedisConnection.isConnected ? 'Connected' : 'disconnected';
    }

}

export const redis = RedisConnection.getInstance();
export { RedisConnection }