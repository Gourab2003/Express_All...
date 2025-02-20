import express from "express";
import CORS from "cors";
import cookieParser from 'cookie-parser';
import { config } from "./config/environment";
import Database from "./config/database";
import authRoutes from "./routes/authRoutes";
import { redis } from "./lib/redis";
import { logger } from "./utils/logger";
import { errorHandler } from "./utils/errorHandler"; // Ensure this import matches
import { cleanup } from "./lib/queue";

const API_PREFIX = '/api/v1';

class Server {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.configure();
        this.connectDatabase();
    }

    private configure() {
        this.app.use(CORS());
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
        this.app.use(errorHandler); // Should now work with updated typing
    }

    private async connectDatabase() {
        try {
            await Database.connect();
            logger.info("Database connection established");
        } catch (error) {
            logger.error("Failed to connect to database:", error);
            process.exit(1);
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
        await cleanup();
        await Database.disconnect();
        server.close(() => {
            logger.info('Server stopped');
            process.exit(0);
        });
    }
}

const server = new Server();
server.start();