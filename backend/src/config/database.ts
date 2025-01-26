import mongoose from "mongoose";
import { config } from "./environment";

class DatabaseConnection {
    // Singleton pattern ensures only one database connection
    private static instance: DatabaseConnection;
    private connection: typeof mongoose | null = null;

    private constructor() { } // Private constructor prevents direct instantiation

    // Method to get the single instance of the class
    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    // Establish database connection
    public async connect(): Promise<void> {
        try {
            this.connection = await mongoose.connect(config.mongoUri);

            // Event listeners for connection status
            mongoose.connection.on('connected', () => {
                console.log(`MongoDB connection successful: ${config.mongoUri}`);
            });

            mongoose.connection.on('error', (err) => {
                console.error(`MongoDB connection error: ${err}`);
            });

            mongoose.connection.on('disconnected', () => {
                console.error('Lost MongoDB connection');
            });
        } catch (error) {
            console.error('Failed to connect to MongoDB', error);
            process.exit(1);
        }
    }

    // Disconnect from the database
    public async disconnect(): Promise<void> {
        if (this.connection) {
            await mongoose.connection.close();
            console.log('MongoDB connection closed');
        }
    }

    // Setup graceful shutdown handlers
    public setupGracefulShutdown(): void {
        // Handle process interruption signals
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

export default DatabaseConnection.getInstance();