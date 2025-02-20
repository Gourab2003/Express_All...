import mongoose from "mongoose";
import { config } from "./environment";
import { logger } from "../utils/logger";

class DatabaseConnection {
    private static instance: DatabaseConnection;
    private connection: typeof mongoose | null = null;

    private constructor() { }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    public async connect(): Promise<void> {
        try {
            this.connection = await mongoose.connect(config.mongoUri);

            mongoose.connection.on('connected', () => {
                logger.info(`MongoDB connection successful: ${config.mongoUri}`);
            });

            mongoose.connection.on('error', (err) => {
                logger.error(`MongoDB connection error: ${err}`);
            });

            mongoose.connection.on('disconnected', () => {
                logger.warn('Lost MongoDB connection');
            });
        } catch (error) {
            logger.error('Failed to connect to MongoDB:', error);
            process.exit(1);
        }
    }

    public async disconnect(): Promise<void> {
        if (this.connection) {
            await mongoose.connection.close();
            logger.info('MongoDB connection closed');
            this.connection = null;
        }
    }

    public getStatus(): string {
        if (!this.connection) return 'disconnected';
        switch (mongoose.connection.readyState) {
            case 0: return 'disconnected';
            case 1: return 'connected';
            case 2: return 'connecting';
            case 3: return 'disconnecting';
            default: return 'unknown';
        }
    }

    public setupGracefulShutdown(): void {
        process.on('SIGINT', async () => {
            await this.disconnect();
            process.exit(1);
        });

        process.on('SIGTERM', async () => {
            await this.disconnect();
            process.exit(0);
        });
    }
}

const Database = DatabaseConnection.getInstance();
export default Database;