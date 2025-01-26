import { Request, Response } from "express";
import User from "../models/User";
import { UserSchema } from "../interfaces/IUser";
import jwt from "jsonwebtoken";
import { config } from "../config/environment";

class AuthController {
    async register(req: Request, res: Response): Promise<void>{
        try {
            const {userName, email, password} = req.body;

            const existingUser = await User.findOne({
                $or: [{email}, {userName}]
            });

            if(existingUser){
                res.status(409).json({
                    status: 'error',
                    message: 'User alredy exist'
                });
                return;
            };

            const newUser = new User({
                userName,
                email,
                password
            });

            await newUser.save();

            const token = jwt.sign(
                {
                    id: newUser._id,
                    role: newUser.role
                },
                config.jwtSecret,
                { expiresIn:'1h' }
            );

            const userResponse = {
                _id: newUser._id,
                userName: newUser.userName,
                email: newUser.email,
                role: newUser.role
            }

            res.status(201).json({
                status: 'success',
                data: {
                    user: userResponse,
                    token
                }
            });

        } catch (error: any) {
            res.status(500).json({
                status: 'error',
                message: 'Registration failed',
                error: error.message
            })
        }
    }
}

export default new AuthController();
