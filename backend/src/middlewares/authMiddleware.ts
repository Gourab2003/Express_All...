import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken'
import { config } from '../config/environment';


interface UserPayload {
    id: string;
    role: string;
    iat: number;
    exp: number
}
declare global {
    namespace Express {
        interface Request {
            user?: UserPayload
        }
    }
}

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        // console.log('object')
        const token = req.cookies.token;

        console.log(token)
        if (!token) {
            res.status(401).json({
                status: "error",
                message: "Authentication required. Please log in"
            });
            return
        };

        try {
            const decoded = jwt.verify(token, config.jwtSecret) as UserPayload;
            const currentTimestamp = Math.floor(Date.now() / 1000);

            if (decoded.exp && decoded.exp < currentTimestamp) {
                res.clearCookie("token", {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "strict",
                })
                res.status(401).json({
                    status: "error",
                    message: "Session expired. Please login first"
                })
            };

            // Attach user information to request object
            req.user = decoded;

            // Add security headers
            res.setHeader("X-Content-Type-Options", "nosniff");
            res.setHeader("X-Frame-Options", "DENY");
            res.setHeader("X-XSS-Protection", "1; mode=block");

            next();
        } catch (error) {
            res.clearCookie("token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            if (error instanceof jwt.JsonWebTokenError) {
                res.status(401).json({
                    status: "error",
                    message: "Invalid token. Please log in again.",
                });
                return
            }

            if (error instanceof jwt.TokenExpiredError) {
                res.status(401).json({
                    status: "error",
                    message: "Session expired. Please log in again.",
                });
                return
            }
            throw error;
        }
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            message: "An error occurred during authentication.",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
        return
    }
}