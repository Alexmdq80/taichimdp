import express from 'express';
import PagoService from '../../services/pagoService.js';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler, AppError } from '../../utils/errors.js';

const router = express.Router();

// All routes in this router will require authentication
router.use(authenticateToken);

/**
 * GET /api/pagos
 * Get all payments with optional filtering
 */
router.get('/', asyncHandler(async (req, res) => {
    const { search = '', categoria = '' } = req.query;
    const pagos = await PagoService.getAllPayments({ search, categoria });
    res.status(200).json({ data: pagos });
}));

/**
 * DELETE /api/pagos/:id
 * Delete (soft-delete) a payment
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.id;
    if (isNaN(id)) {
        throw new AppError('Invalid ID: ID must be a valid integer', 400);
    }
    
    await PagoService.deletePayment(id, userId);
    res.status(200).json({ message: 'Payment deleted successfully', data: { id } });
}));

export default router;
