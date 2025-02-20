import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Dynamically select environment file based on NODE_ENV
const envFile = process.env.NODE_ENV
    ? `.env.${process.env.NODE_ENV}`
    : '.env';

// Load environment variables from the selected file
dotenv.config({
    path: path.resolve(process.cwd(), envFile)
});

// ESM equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define a TypeScript interface for configuration
interface Config {
    port: number;
    mongoUri: string;
    nodeEnv: string;
    jwtSecret: string;
    jwtSecretExpiry: string;
    corsOrigin: string;
    REDIS_USERNAME: string;
    REDIS_PASSWORD: string;
    REDIS_HOST: string;
    REDIS_PORT: number;
    LOG_DIR: string;
    REDIS_TIMEOUT?: number;
}

// Export configuration with fallback values
export const config: Config = {
    port: parseInt(process.env.PORT || '5000', 10),
    mongoUri: process.env.MONGODB_URI || 'mongodb+srv://...',
    nodeEnv: process.env.NODE_ENV || 'development',
    jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
    jwtSecretExpiry: process.env.JWT_EXPIRES_IN || '1h',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    REDIS_USERNAME: process.env.REDIS_USERNAME || 'default',
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || 'V1jsaxDPKXxP6ytdLzj2ZJ1RBLl4kXb9',
    REDIS_HOST: process.env.REDIS_HOST || 'redis-17188.crce182.ap-south-1-1.ec2.redns.redis-cloud.com',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '17188', 10),
    LOG_DIR: process.env.LOG_DIR || path.join(__dirname, '..', 'logs'), // Now works in ESM
    REDIS_TIMEOUT: parseInt(process.env.REDIS_TIMEOUT || '10000', 10)
};