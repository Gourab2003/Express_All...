import { Request, Response, NextFunction } from 'express';
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
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof APIError) {
        // Log operational errors
        logger.warn({
            message: err.message,
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
            body: req.body
        });

        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
    }

    // Programming or other unknown errors
    logger.error({
        message: err.message,
        stack: err.stack,
        path: req.path,
        method: req.method,
        body: req.body
    });

    // Don't leak error details in production
    return res.status(500).json({
        status: 'error',
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message
    });
};

// Async error wrapper to avoid try-catch blocks
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

// Common error types
export const CommonErrors = {
    NotFound: (resource: string) =>
        new APIError(`${resource} not found`, 404),

    Unauthorized: () =>
        new APIError('Unauthorized access', 401),

    BadRequest: (message: string) =>
        new APIError(message, 400),

    ValidationError: (message: string) =>
        new APIError(message, 422),

    Forbidden: () =>
        new APIError('Forbidden access', 403)
};