import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js'; // Changed to AppError

export const registerUser = async (email, password) => {
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
        throw new AppError('User with that email already exists', 409); // Changed to AppError
    }

    // In a self-registration flow, creatorId is null
    const user = await User.create({ email, password }, null);
    
    // For security, do not return the password hash
    // The user object is an instance of User, so we can call toJSON if available or destructure
    return user.toJSON ? user.toJSON() : (() => {
        const { password: _, ...rest } = user;
        return rest;
    })();
};

export const loginUser = async (email, password) => {
    const user = await User.findByEmail(email);
    if (!user) {
        throw new AppError('Invalid credentials', 401); // Changed to AppError
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        throw new AppError('Invalid credentials', 401); // Changed to AppError
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new AppError('JWT_SECRET is not defined in environment variables', 500);
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, secret, { expiresIn: '1h' });
    return { token, userId: user.id, email: user.email };
};
