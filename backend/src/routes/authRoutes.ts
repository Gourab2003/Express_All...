import express from 'express';
import authController from '../controllers/authController';
import { validateRequest } from '../middlewares/validateRequest';
import { UserSchema } from '../interfaces/IUser';
import loginSchema from '../interfaces/LoginSchema'
import { authenticate } from '../middlewares/authMiddleware';

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

router.get(
    '/logout',
    authenticate,
    authController.logout
)

export default router;