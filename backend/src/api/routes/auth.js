import express from 'express';
import { registerUser, loginUser } from '../../services/authService.js';
import { AppError } from '../../utils/errors.js'; // Changed to AppError
import { validateUser } from '../../utils/validators.js';

const router = express.Router();

router.post('/register', async (req, res, next) => {
    try {
        validateUser(req.body); // Validate email and password
        const { email, password } = req.body;
        const user = await registerUser(email, password);
        res.status(201).json({ message: 'User registered successfully', user });
    } catch (error) {
        next(error);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        // Basic validation for login - we don't need full user validation for existing users
        const { email, password } = req.body;
        if (!email || !password) {
            throw new AppError('Email and password are required', 400); // Changed to AppError
        }

        const { token, userId, email: userEmail } = await loginUser(email, password);
        res.status(200).json({ message: 'Logged in successfully', token, userId, email: userEmail });
    } catch (error) {
        next(error);
    }
});

export default router;