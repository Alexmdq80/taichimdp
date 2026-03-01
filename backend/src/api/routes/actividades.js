import express from 'express';
import { Actividad } from '../../models/Actividad.js';
import { asyncHandler, AppError } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken); // Apply authentication middleware

/**
 * GET /api/actividades
 * List all actividades
 */
router.get('/', asyncHandler(async (req, res) => {
  const actividades = await Actividad.findAll();
  res.json({ data: actividades });
}));

/**
 * GET /api/actividades/:id
 * Get actividad by ID
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const actividad = await Actividad.findById(id);
  if (!actividad) throw new AppError('Actividad not found', 404);
  res.json({ data: actividad });
}));

/**
 * GET /api/actividades/:id/history
 * Get activity history
 */
router.get('/:id/history', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const history = await Actividad.getHistory(id);
  res.json({ data: history });
}));

/**
 * POST /api/actividades
 * Create a new actividad
 */
router.post('/', asyncHandler(async (req, res) => {
  const { nombre, descripcion, activo } = req.body;
  const userId = req.user.userId;
  if (!nombre) throw new AppError('Nombre is required', 400);
  const actividad = await Actividad.create({ nombre, descripcion, activo }, userId);
  res.status(201).json({ data: actividad });
}));

/**
 * PUT /api/actividades/:id
 * Update a actividad
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const data = req.body;
  const userId = req.user.userId;
  const updatedActividad = await Actividad.update(id, data, userId);
  if (!updatedActividad) throw new AppError('Actividad not found', 404);
  res.json({ data: updatedActividad });
}));

/**
 * DELETE /api/actividades/:id
 * Delete a actividad (Soft delete)
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id, 10);
  const userId = req.user.userId;
  const deleted = await Actividad.delete(id, userId);
  if (!deleted) throw new AppError('Actividad not found', 404);
  res.json({ message: 'Actividad deleted successfully', data: { id } });
}));

export default router;
