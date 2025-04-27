import express from 'express';
import { login,register,logout } from '../controller/authController.js';
import { adminMiddleware,authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Register User
router.post('/register',authMiddleware,adminMiddleware, register);

// Login User
router.post('/login', login);

router.post('/logout',authMiddleware,logout);

export default router;
