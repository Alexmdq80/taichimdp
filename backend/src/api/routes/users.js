import express from 'express';
import { User } from '../../models/User.js';
import { asyncHandler } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/users
 * List all users
 */
router.get('/', asyncHandler(async (req, res) => {
    const users = await User.findAll();
    res.json({ data: users.map(u => u.toJSON()) });
}));

export default router;
