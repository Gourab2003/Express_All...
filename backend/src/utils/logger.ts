import winston, { format, transports, LoggerOptions } from "winston";
import fs from "fs";
import path from "path";
import { config } from "../config/environment"; // Ensure `nodeEnv` is used correctly

// Ensure logs directory exists
const logDir = path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

// Define colors
const colors = {
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "white",
};

// Apply colors to Winston
winston.addColors(colors);

// Set log level based on environment
const logLevel = config.nodeEnv === "development" ? "debug" : "info";

// Define log formats
const developmentFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.colorize({ all: true }),
    format.printf(({ timestamp, level, message, stack }: winston.Logform.TransformableInfo) =>
        stack
            ? `${timestamp} ${level}: ${message} \nStack: ${stack}`
            : `${timestamp} ${level}: ${message}`
    )
);

const productionFormat = format.combine(
    format.timestamp(),
    format.json()
);

// Logger configuration
const loggerOptions: LoggerOptions = {
    level: logLevel,
    levels,
    format: config.nodeEnv === "development" ? developmentFormat : productionFormat,
    transports: [
        new transports.Console(),

        new transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),

        new transports.File({
            filename: path.join(logDir, "combined.log"),
            maxsize: 5 * 1024 * 1024, // 5MB
            maxFiles: 5,
        }),
    ],
    exitOnError: false,
};

// Create Winston logger
const logger = winston.createLogger(loggerOptions);

// Stream for Morgan logging
const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

export { logger, stream };
