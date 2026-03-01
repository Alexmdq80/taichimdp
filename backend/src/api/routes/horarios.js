import express from 'express';
import Horario from '../../models/Horario.js';
import { AppError, asyncHandler } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/horarios
 * Get all schedules with filters
 */
router.get('/', asyncHandler(async (req, res) => {
    const filters = {
        actividad_id: req.query.actividad_id,
        lugar_id: req.query.lugar_id,
        dia_semana: req.query.dia_semana,
        activo: req.query.activo
    };
    const horarios = await Horario.findAll(filters);
    res.json({ data: horarios.map(h => h.toJSON()) });
}));

/**
 * GET /api/horarios/:id/history
 * Get schedule history
 */
router.get('/:id/history', asyncHandler(async (req, res) => {
    const history = await Horario.getHistory(req.params.id);
    res.json({ data: history });
}));

/**
 * POST /api/horarios
 * Create a new weekly schedule
 */
router.post('/', asyncHandler(async (req, res) => {
    const data = req.body;
    const userId = req.user.userId;

    if (!data.actividad_id || !data.lugar_id || data.dia_semana === undefined || !data.hora_inicio || !data.hora_fin) {
        throw new AppError('Todos los campos son obligatorios (actividad, lugar, día, hora inicio, hora fin)', 400);
    }

    const horario = await Horario.create(data, userId);
    res.status(201).json({ data: horario.toJSON() });
}));

/**
 * PUT /api/horarios/:id
 * Update a weekly schedule
 */
router.put('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const data = req.body;
    const userId = req.user.userId;

    const updated = await Horario.update(id, data, userId);
    if (!updated) throw new AppError('Horario no encontrado', 404);

    res.json({ data: updated.toJSON() });
}));

/**
 * DELETE /api/horarios/:id
 * Delete (soft-delete) a weekly schedule
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const deleted = await Horario.delete(id, userId);
    if (!deleted) throw new AppError('Horario no encontrado', 404);

    res.json({ message: 'Horario eliminado con éxito', data: { id } });
}));

export default router;
