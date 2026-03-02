import express from 'express';
import Deuda from '../../models/Deuda.js';
import Practicante from '../../models/Practicante.js';
import { asyncHandler, AppError } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';
import pool from '../../config/database.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/deudas
 * Lista todas las deudas con filtros opcionales.
 */
router.get('/', asyncHandler(async (req, res) => {
    const { practicante_id, estado } = req.query;
    
    // We want to join with Practicante to get the name
    let sql = `
        SELECT d.*, p.nombre_completo as practicante_nombre
        FROM Deuda d
        JOIN Practicante p ON d.practicante_id = p.id
        WHERE d.deleted_at IS NULL
    `;
    const params = [];

    if (practicante_id) {
        sql += ' AND d.practicante_id = ?';
        params.push(practicante_id);
    }

    if (estado) {
        sql += ' AND d.estado = ?';
        params.push(estado);
    }

    sql += ' ORDER BY d.fecha DESC, d.created_at DESC';

    const [rows] = await pool.execute(sql, params);
    res.json({ data: rows });
}));

/**
 * PUT /api/deudas/:id/pagar
 * Marca una deuda como pagada.
 */
router.put('/:id/pagar', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const deuda = await Deuda.findById(id);
    if (!deuda) throw new AppError('Deuda no encontrada', 404);
    if (deuda.estado !== 'pendiente') throw new AppError('Solo se pueden pagar deudas pendientes', 400);

    const sql = 'UPDATE Deuda SET estado = "pagada" WHERE id = ?';
    await pool.execute(sql, [id]);

    const updated = await Deuda.findById(id);
    await Deuda.recordHistory(id, 'PAY', deuda.toJSON(), updated.toJSON(), userId);

    res.json({ message: 'Deuda marcada como pagada', data: updated.toJSON() });
}));

/**
 * PUT /api/deudas/:id/cancelar
 * Cancela una deuda (por error o condonación).
 */
router.put('/:id/cancelar', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const deuda = await Deuda.findById(id);
    if (!deuda) throw new AppError('Deuda no encontrada', 404);
    if (deuda.estado !== 'pendiente') throw new AppError('Solo se pueden cancelar deudas pendientes', 400);

    const sql = 'UPDATE Deuda SET estado = "cancelada" WHERE id = ?';
    await pool.execute(sql, [id]);

    const updated = await Deuda.findById(id);
    await Deuda.recordHistory(id, 'CANCEL', deuda.toJSON(), updated.toJSON(), userId);

    res.json({ message: 'Deuda cancelada correctamente', data: updated.toJSON() });
}));

/**
 * DELETE /api/deudas/:id
 * Eliminación física lógica (soft delete).
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const deuda = await Deuda.findById(id);
    if (!deuda) throw new AppError('Deuda no encontrada', 404);

    const sql = 'UPDATE Deuda SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
    await pool.execute(sql, [id]);

    await Deuda.recordHistory(id, 'DELETE', deuda.toJSON(), null, userId);

    res.json({ message: 'Registro de deuda eliminado' });
}));

export default router;
