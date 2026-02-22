import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { AppError } from '../utils/errors.js'; // Changed to AppError

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        return next(new AppError('Authentication token required', 401)); // Changed to AppError
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return next(new AppError('Invalid or expired token', 403)); // Changed to AppError
        }
        req.user = user; // Attach the payload to the request object
        next();
    });
};