import express from "express";
import CORS from "cors";
import cookieParser from 'cookie-parser'
import { config } from "./config/environment";
import Database from "./config/database";
import authRoutes from "./routes/authRoutes";
import { redis } from "./lib/redis";

const API_PREFIX = '/api/v1';

class Server {
    private app: express.Application;

    constructor() {
        this.app = express();
        this.configure();
        this.connectDatabase();
    }

    // Configure middleware and routes
    private configure() {
        this.app.use(CORS());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cookieParser());

        // Health check endpoint
        this.app.get('/api/health', async(req, res) => {
            let redisStatus = 'Unknown';
            let dbStatus = 'Unknown';
            // In your server.ts health check
            try {
                await redis.ping();
                redisStatus = 'connected';
            } catch (err) {
                redisStatus = 'disconnected';
                console.error('Redis connection check failed:', err);
            }
            res.status(200).json({
                status: 'healthy',
                database: dbStatus,
                redis: redisStatus,
                timestamp: new Date().toISOString(),
            });
        });

        //! Auth routes
        this.app.use(`${API_PREFIX}/auth`, authRoutes)
    }

    // Connect to the database
    private async connectDatabase() {
        try {
            await Database.connect();
            console.log("Database connection successful.");
        } catch (error) {
            console.error("Failed to connect to the database:", error);
        }
    }

    // Start the server
    public start() {
        const port = config.port;
        this.app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    }
}

const server = new Server();
server.start();