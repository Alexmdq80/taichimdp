import express from 'express';
import TipoAbonoService from '../../services/tipoAbonoService.js';
import { authenticateToken } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/errors.js';
import { sanitizeObject } from '../../utils/validators.js';

const router = express.Router();

// All routes in this router will require authentication
router.use(authenticateToken);

/**
 * GET /api/tipos-abono
 * Get all tipos de abono
 */
router.get('/', asyncHandler(async (req, res) => {
    const tiposAbono = await TipoAbonoService.findAll();
    res.status(200).json({ data: tiposAbono });
}));

/**
 * GET /api/tipos-abono/:id
 * Get tipo de abono by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID', details: 'ID must be a valid integer' });
    }
    const tipoAbono = await TipoAbonoService.findById(id);
    res.status(200).json({ data: tipoAbono });
}));

/**
 * GET /api/tipos-abono/:id/history
 * Get history for a tipo de abono
 */
router.get('/:id/history', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID', details: 'ID must be a valid integer' });
    }
    const history = await TipoAbonoService.getHistory(id);
    res.status(200).json({ data: history });
}));

/**
 * POST /api/tipos-abono
 * Create a new tipo de abono
 */
router.post('/', asyncHandler(async (req, res) => {
    const data = sanitizeObject(req.body);
    const userId = req.user.id;
    const newTipoAbono = await TipoAbonoService.create(data, userId);
    res.status(201).json({ message: 'Tipo de abono created successfully', data: newTipoAbono });
}));

/**
 * PUT /api/tipos-abono/:id
 * Update an existing tipo de abono
 */
router.put('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID', details: 'ID must be a valid integer' });
    }
    const data = sanitizeObject(req.body);
    const userId = req.user.id;
    const updatedTipoAbono = await TipoAbonoService.update(id, data, userId);
    res.status(200).json({ message: 'Tipo de abono updated successfully', data: updatedTipoAbono });
}));

/**
 * DELETE /api/tipos-abono/:id
 * Delete a tipo de abono
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID', details: 'ID must be a valid integer' });
    }
    const userId = req.user.id;
    await TipoAbonoService.delete(id, userId);
    res.status(200).json({ message: 'Tipo de abono deleted successfully', data: { id } });
}));

export default router;
