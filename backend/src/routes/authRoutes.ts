import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validateMiddleware';
import { registerSchema, loginSchema } from '../validators/authValidator';

const router = express.Router();

router.post('/register', validate(registerSchema), registerUser);
router.post('/login', validate(loginSchema), loginUser);
router.get('/me', protect, getMe);

export default router;
