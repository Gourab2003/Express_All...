import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/environment';
import { APIError } from '../utils/errorHandler';
import { logger } from '../utils/logger';

interface UserPayload {
    id: string;
    role: string;
    iat: number;
    exp: number;
}

declare global {
    namespace Express {
        interface Request {
            user?: UserPayload;
        }
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const token = req.cookies.token;
        if (!token) {
            throw new APIError('Authentication required. Please log in', 401);
        }

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as UserPayload;
            const currentTimestamp = Math.floor(Date.now() / 1000);

            if (decoded.exp && decoded.exp < currentTimestamp) {
                res.clearCookie('token', {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                });
                throw new APIError('Session expired. Please log in again', 401);
            }

            req.user = decoded;

            // Add security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');

            next();
        } catch (error) {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            if (error instanceof jwt.JsonWebTokenError) {
                throw new APIError('Invalid token. Please log in again', 401);
            }
            if (error instanceof jwt.TokenExpiredError) {
                throw new APIError('Session expired. Please log in again', 401);
            }
            throw error; // Rethrow unexpected errors
        }
    } catch (error) {
        logger.error('Authentication error:', error);
        next(error); // Pass to errorHandler instead of sending response
    }
};