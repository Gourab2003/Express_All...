import express from 'express';
import authController from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import { UserSchema } from '../interfaces/IUser';

const router = express.Router();

router.post(
    '/register',
    validateRequest(UserSchema),
    authController.register
);

export default router;