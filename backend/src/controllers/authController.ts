import { Request, Response } from "express";
import User from "../models/User.Schema";
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
    };

    async login(req: Request, res: Response): Promise<void>{
        try {
            const {email, password} = req.body;
            const user =await User.findOne({email});
            if(!user){
                res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                })
                return;
            }

            const isMatch = await user.comparePassword(password);
            if(!isMatch){
                res.status(401).json({
                    status: 'error',
                    message: 'Invalid email or password'
                })
                return;
            }
            const token = jwt.sign(
                {
                    id: user._id.toString(),
                    role: user.role
                },
                config.jwtSecret,
                {expiresIn: '1h'}
            );

            res.cookie("token", token,{
                httpOnly: true,
                secure: process.env.NODE_ENV === "production", 
                sameSite: "strict",
                maxAge: 60*60*1000
            });

            res.status(200).json(
                {
                    status: 'success',
                    message: "Loged in successfully",
                    data: {
                        token,
                        user: {
                            id: user._id,
                            email: user.email,
                            userName: user.userName,
                            role: user.role
                        }
                    }
                }
            );
        } catch (error:any) {
           res.status(500).json({
            status: 'error',
            message: 'Login failed',
            error: error.message
           }) 
        }
    };

    async logout(req:Request, res:Response):Promise<void>{
        try {
            res.clearCookie("token");
            res.status(200).json({
                status: "Success",
                message: "Logged out successfully"
            })
        } catch (error:any) {
            res.status(500).json({
                status: "error",
                message: "Logout failed",
                error: error.message
            })
        }
    }
}

export default new AuthController();
