import express from 'express';
import PagoSocio from '../../models/PagoSocio.js';
import { asyncHandler, AppError } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/pagos-socios
 */
router.get('/', asyncHandler(async (req, res) => {
    const { socio_id, es_costo } = req.query;
    const filters = { socio_id };
    if (es_costo !== undefined) filters.es_costo = es_costo === 'true';
    
    const pagos = await PagoSocio.findAll(filters);
    res.json({ data: pagos.map(p => p.toJSON()) });
}));

/**
 * POST /api/pagos-socios
 */
router.post('/', asyncHandler(async (req, res) => {
    const { socio_id, monto, fecha_pago, mes_abono, fecha_vencimiento, observaciones, es_costo } = req.body;
    const userId = req.user.userId;

    if (!socio_id || !fecha_pago || !mes_abono || !fecha_vencimiento) {
        throw new AppError('Faltan campos obligatorios', 400);
    }

    const pago = await PagoSocio.create({
        socio_id, monto, fecha_pago, mes_abono, fecha_vencimiento, observaciones, es_costo
    }, userId);

    res.status(201).json({ data: pago.toJSON() });
}));

/**
 * DELETE /api/pagos-socios/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const deleted = await PagoSocio.delete(id, userId);
    if (!deleted) throw new AppError('Pago no encontrado', 404);
    res.json({ message: 'Pago eliminado correctamente' });
}));

export default router;
