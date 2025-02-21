import { Response } from "express";


interface ApiResponse {
    status: 'Success' | 'Error';
    message: string;
    data?: any;
    pagination?: {
        current: number;
        pages: number;
        total: number;
        limit: number;
    };
}

export enum HttpStatus{
    OK = 200,
    CREATED = 201,  
    NO_CONTENT = 204,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOT_FOUND = 404,
    CONFLICT = 409,
    INTERNAL_SERVER_ERROR = 500
}

export const createResposne = (
    res: Response,
    statusCode: HttpStatus,
    message: string,
    data?: any,
    pagination?: ApiResponse['pagination']
): Response => {
    const response: ApiResponse = {
        status: statusCode >= 400 ? 'Success' : 'Error',
        message,
        ...(data && { data }),
        ...(pagination && { pagination })
    };
    return res.status(statusCode).json(response);
}
