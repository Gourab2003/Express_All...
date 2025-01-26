import express from "express";
import CORS from "cors";
import { config } from "./config/environment";
import Database from "./config/database";

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

        // Health check endpoint
        this.app.get('/api/health', (req, res) => {
            res.status(200).json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
            });
        });
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