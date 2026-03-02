import express from 'express';
import PagoSocio from '../../models/PagoSocio.js';
import Practicante from '../../models/Practicante.js';
import Socio from '../../models/Socio.js';
import { asyncHandler, AppError } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

/**
 * GET /api/pagos-socios
 */
router.get('/', asyncHandler(async (req, res) => {
    const { socio_id } = req.query;
    const filters = { socio_id };
    
    const pagos = await PagoSocio.findAll(filters);
    res.json({ data: pagos.map(p => p.toJSON()) });
}));

/**
 * POST /api/pagos-socios
 */
router.post('/', asyncHandler(async (req, res) => {
    const { socio_id, monto, fecha_pago, mes_abono, fecha_vencimiento, observaciones } = req.body;
    const userId = req.user.userId;

    if (!socio_id || !fecha_pago || !mes_abono || !fecha_vencimiento) {
        throw new AppError('Faltan campos obligatorios', 400);
    }

    // Restriction: Only allow DIRECT creation of PagoSocio for professors.
    // Students MUST use the Pago API (createSocialFeeOnlyPayment) to ensure cash registration.
    const socio = await Socio.findById(socio_id);
    if (!socio) throw new AppError('Socio no encontrado', 404);

    // Duplication Check
    const alreadyPaid = await PagoSocio.existsForSocioAndMonth(socio_id, mes_abono);
    if (alreadyPaid) {
        throw new AppError(`Ya existe un pago registrado para ${mes_abono} para este socio.`, 400);
    }
    
    const practicante = await Practicante.findById(socio.practicante_id);
    if (!practicante || !practicante.es_profesor) {
        throw new AppError('Los cobros a alumnos deben registrarse desde la sección de Practicantes para impactar en caja.', 403);
    }

    const pago = await PagoSocio.create({
        socio_id, monto, fecha_pago, mes_abono, fecha_vencimiento, observaciones
    }, null, userId);

    res.status(201).json({ data: pago.toJSON() });
}));

/**
 * PUT /api/pagos-socios/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;
    const { monto, fecha_pago, mes_abono, fecha_vencimiento, observaciones } = req.body;

    const updated = await PagoSocio.update(id, {
        monto, fecha_pago, mes_abono, fecha_vencimiento, observaciones
    }, null, userId);

    if (!updated) throw new AppError('Pago no encontrado', 404);
    res.json({ data: updated.toJSON() });
}));

/**
 * DELETE /api/pagos-socios/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const userId = req.user.userId;

    const deleted = await PagoSocio.delete(id, null, userId);
    if (!deleted) throw new AppError('Pago no encontrado', 404);
    res.json({ message: 'Pago eliminado correctamente' });
}));

export default router;
