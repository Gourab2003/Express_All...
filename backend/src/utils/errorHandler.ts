import express, { ErrorRequestHandler } from 'express';
import { logger } from './logger';

// Custom error class for API errors
export class APIError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

// Error handler middleware
export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    const sanitizedBody = { ...req.body, password: undefined, token: undefined };
    if (err instanceof APIError) {
        logger.warn({ message: err.message, statusCode: err.statusCode, path: req.path, method: req.method, body: sanitizedBody });
        res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    } else {
        logger.error({ message: err.message, stack: err.stack, path: req.path, method: req.method, body: sanitizedBody });
        res.status(500).json({
            status: 'error',
            message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        });
    }
    // No explicit return; res.json() completes the response
};

export const asyncHandler = (fn: Function) => {
    return (req: express.Request, res: express.Response, next: express.NextFunction) =>
        Promise.resolve(fn(req, res, next)).catch(next);
};

export const CommonErrors = {
    NotFound: (resource: string) => new APIError(`${resource} not found`, 404),
    Unauthorized: () => new APIError('Unauthorized access', 401),
    BadRequest: (message: string) => new APIError(message, 400),
    ValidationError: (message: string) => new APIError(message, 422),
    Forbidden: () => new APIError('Forbidden access', 403)
};