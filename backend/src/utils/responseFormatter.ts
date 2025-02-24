import { Response } from 'express';

// HTTP status codes enum (assuming you have this)
export enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NOT_FOUND = 404,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    UNPROCESSABLE_ENTITY = 422,
    INTERNAL_SERVER_ERROR = 500
}

interface ApiResponse {
    status: 'success' | 'error';
    message: string;
    data?: any;
    pagination?: {
        current: number;
        pages: number;
        total: number;
        limit: number;
    };
}

export const createResponse = (
    res: Response,
    statusCode: number,
    message: string,
    data?: any,
    pagination?: ApiResponse['pagination']
): Response => {
    const response: ApiResponse = {
        status: statusCode >= 400 ? 'error' : 'success',
        message,
        ...(data && { data }),
        ...(pagination && { pagination })
    };

    return res.status(statusCode).json(response);
};