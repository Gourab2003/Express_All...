import express from 'express';
import authController from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import { UserSchema } from '../interfaces/IUser';
import loginSchema from '../interfaces/LoginSchema'

const router = express.Router();

//Registration route
router.post(
    '/register',
    validateRequest(UserSchema),
    authController.register
);

router.post(
    '/login',
    validateRequest(loginSchema),
    authController.login
);

router.get

export default router;