import express from 'express';
import { Lugar } from '../../models/Lugar.js';
import { asyncHandler, AppError } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); // Apply authentication middleware

/**
 * GET /api/lugares
 * List all lugares
 */
router.get('/', asyncHandler(async (req, res) => {
  const lugares = await Lugar.findAll();
  res.json({ data: lugares });
}));

/**
 * GET /api/lugares/:id
 * Get lugar by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const lugar = await Lugar.findById(id);
  if (!lugar) throw new AppError('Lugar not found', 404);
  res.json({ data: lugar });
}));

/**
 * POST /api/lugares
 * Create a new lugar
 */
router.post('/', asyncHandler(async (req, res) => {
  const { nombre, direccion, activo } = req.body;
  if (!nombre) throw new AppError('Nombre is required', 400);
  const lugar = await Lugar.create({ nombre, direccion, activo });
  res.status(201).json({ data: lugar });
}));

/**
 * PUT /api/lugares/:id
 * Update a lugar
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = req.body;
  const updatedLugar = await Lugar.update(id, data);
  if (!updatedLugar) throw new AppError('Lugar not found', 404);
  res.json({ data: updatedLugar });
}));

/**
 * DELETE /api/lugares/:id
 * Delete a lugar
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const deleted = await Lugar.delete(id);
  if (!deleted) throw new AppError('Lugar not found', 404);
  res.json({ message: 'Lugar deleted successfully', data: { id } });
}));

export default router;
