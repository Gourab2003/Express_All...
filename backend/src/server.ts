import express from "express";
import CORS from "cors";
import cookieParser from 'cookie-parser';
import { config } from "./config/environment";
import Database from "./config/database";
import authRoutes from "./routes/authRoutes";
import blogRoutes from "./routes/blogRoutes";
import { redis, RedisConnection } from "./lib/redis";
import { logger } from "./utils/logger";
import { errorHandler } from "./utils/errorHandler";

const API_PREFIX = '/api/v1';

class Server {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.configure();
        this.initialize();
    }

    private configure() {
        this.app.use(CORS({
            origin: [config.corsOrigin],
            credentials: true
        }));
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());

        this.app.get('/api/health', async (req, res) => {
            let redisStatus = 'disconnected';
            const dbStatus = Database.getStatus();
            try {
                await redis.ping();
                redisStatus = 'connected';
            } catch (err) {
                logger.error('Redis health check failed:', err);
            }
            res.status(200).json({
                status: 'healthy',
                database: dbStatus,
                redis: redisStatus,
                timestamp: new Date().toISOString()
            });
        });

        this.app.use(`${API_PREFIX}/auth`, authRoutes);
        this.app.use(`${API_PREFIX}/blog`, blogRoutes);
        this.app.use(errorHandler);
    }

    private async initialize() {
        try {
            await this.connectDatabase();
            logger.info("Initializing Redis connection...");
            await RedisConnection.waitForConnection();
            logger.info("Redis connection established");
        } catch (error) {
            logger.error("Initialization failed:", error);
            process.exit(1);
        }
    }

    private async connectDatabase() {
        try {
            await Database.connect();
            logger.info("Database connection established");
        } catch (error) {
            logger.error("Failed to connect to database:", error);
            throw error;
        }
    }

    public start() {
        const port = config.port;
        const server = this.app.listen(port, () => {
            logger.info(`Server running on port ${port}`);
        });

        Database.setupGracefulShutdown();
        process.on('SIGTERM', () => this.shutdown(server));
        process.on('SIGINT', () => this.shutdown(server));
    }

    private async shutdown(server: any) {
        logger.info('Shutting down server...');
        try {
            await Database.disconnect();
            logger.info("Database disconnected");
        } catch (error) {
            logger.error("Error disconnecting from database:", error);
        }
        server.close(() => {
            logger.info('HTTP server stopped');
            process.exit(0);
        });
    }
}

const server = new Server();
server.start();