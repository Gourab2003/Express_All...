import winston, { format, transports, LoggerOptions } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import fs from "fs";
import path from "path";
import { config } from "../config/environment";

const logDir = config.LOG_DIR || path.join(__dirname, "..", "logs");
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: "red", warn: "yellow", info: "green", http: "magenta", debug: "white" };
winston.addColors(colors);

const logLevel = config.nodeEnv === "development" ? "debug" : "info";

const developmentFormat = format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.colorize({ all: true }),
    format.printf(({ timestamp, level, message, stack }) =>
        stack ? `${timestamp} ${level}: ${message} \nStack: ${stack}` : `${timestamp} ${level}: ${message}`
    )
);

const productionFormat = format.combine(format.timestamp(), format.json());

const loggerOptions: LoggerOptions = {
    level: logLevel,
    levels,
    format: config.nodeEnv === "development" ? developmentFormat : productionFormat,
    transports: [
        new transports.Console(),
        new DailyRotateFile({
            filename: path.join(logDir, "error-%DATE%.log"),
            level: "error",
            maxSize: "5m",
            maxFiles: "14d",
            datePattern: "YYYY-MM-DD"
        }),
        new DailyRotateFile({
            filename: path.join(logDir, "combined-%DATE%.log"),
            maxSize: "5m",
            maxFiles: "14d",
            datePattern: "YYYY-MM-DD"
        })
    ],
    exitOnError: false
};

const logger = winston.createLogger(loggerOptions);

const stream = {
    write: (message: string) => logger.http(message.trim())
};

export { logger, stream };