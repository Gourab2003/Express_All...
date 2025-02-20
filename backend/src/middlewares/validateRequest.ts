import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { APIError } from '../utils/errorHandler';

export const validateRequest = (schema: ZodSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error: any) {
            const message = error.errors
                ? error.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ')
                : 'Validation failed';
            next(new APIError(message, 422));
        }
    };
};