import dotenv from 'dotenv';
import path from 'path';

// Dynamically select environment file based on NODE_ENV
const envFile = process.env.NODE_ENV
    ? `.env.${process.env.NODE_ENV}`
    : '.env';

// Load environment variables from the selected file
dotenv.config({
    path: path.resolve(process.cwd(), envFile)
});

// Define a TypeScript interface for configuration
interface Config {
    port: number;
    mongoUri: string;
    nodeEnv: string;
    jwtSecret: string;
    corsOrigin: string;
}

// Export configuration with fallback values
export const config: Config = {
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb+srv://...',
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}
