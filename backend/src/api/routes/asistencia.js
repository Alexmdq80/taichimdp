import express from 'express';
import Clase from '../../models/Clase.js';
import Asistencia from '../../models/Asistencia.js';
import AsistenciaService from '../../services/asistenciaService.js';
import { AppError, asyncHandler } from '../../utils/errors.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * GET /api/asistencia/clases/:id/practicantes
 * Obtiene los practicantes elegibles para asistir a esta sesión de clase
 * (aquellos con abono activo en el lugar y fecha de la clase).
 */
router.get('/clases/:id/practicantes', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const clase = await Clase.findById(id);
    if (!clase) throw new AppError('Clase no encontrada', 404);

    // 1. Obtener elegibles (quienes tienen abono activo)
    const elegibles = await Asistencia.getEligiblePracticantes(
        clase.actividad_id, 
        clase.lugar_id, 
        clase.fecha
    );

    // 2. Obtener quienes ya tienen asistencia marcada
    const asistenciaActual = await Asistencia.findByClase(id);
    const asistieronMap = new Map(asistenciaActual.map(a => [a.practicante_id, a.asistio]));

    // 3. Cruzar datos
    const data = elegibles.map(p => ({
        ...p,
        asistio: asistieronMap.has(p.id) ? asistieronMap.get(p.id) : false
    }));

    res.json({ data });
}));

/**
 * POST /api/asistencia/clases/:id/registrar
 * Registra la asistencia de múltiples practicantes a la vez.
 */
router.post('/clases/:id/registrar', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { asistencias } = req.body; // Array de { practicante_id, asistio }

    if (!Array.isArray(asistencias)) {
        throw new AppError('Se requiere un array de asistencias', 400);
    }

    for (const a of asistencias) {
        await Asistencia.upsert({
            clase_id: id,
            practicante_id: a.practicante_id,
            asistio: a.asistio
        });
    }

    res.json({ message: 'Asistencia registrada con éxito' });
}));

/**
 * POST /api/asistencia/clases/generar
 * Genera clases basadas en los horarios semanales para un periodo.
 */
router.post('/clases/generar', asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.body;
    const userId = req.user.id;

    if (!startDate || !endDate) {
        throw new AppError('Se requieren las fechas de inicio y fin para generar las clases', 400);
    }

    const clases = await AsistenciaService.generarClasesDesdeHorarios(startDate, endDate, userId);
    res.status(201).json({ 
        message: `${clases.length} clases generadas con éxito`,
        data: clases 
    });
}));

/**
 * GET /api/clases
 * Get sessions list with filters
 */
router.get('/clases', asyncHandler(async (req, res) => {
    const filters = {
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        actividad_id: req.query.actividad_id,
        lugar_id: req.query.lugar_id
    };
    const clases = await Clase.findAll(filters);
    res.json({ data: clases.map(c => c.toJSON()) });
}));

/**
 * GET /api/clases/:id
 * Get specific session by ID
 */
router.get('/clases/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const clase = await Clase.findById(id);
    if (!clase) throw new AppError('Clase no encontrada', 404);
    res.json({ data: clase.toJSON() });
}));

/**
 * POST /api/clases
 * Create a new specific session (instance)
 */
router.post('/clases', asyncHandler(async (req, res) => {
    const data = req.body;
    data.usuario_id = req.user.id;

    if (!data.actividad_id || !data.lugar_id || !data.fecha || !data.hora || !data.hora_fin) {
        throw new AppError('Todos los campos son obligatorios (actividad, lugar, fecha, hora inicio, hora fin)', 400);
    }

    const clase = await Clase.create(data);
    res.status(201).json({ data: clase.toJSON() });
}));

/**
 * DELETE /api/clases/:id
 * Delete (soft-delete) a specific session
 */
router.delete('/clases/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const deleted = await Clase.delete(id);
    if (!deleted) throw new AppError('Clase no encontrada', 404);
    res.json({ message: 'Clase eliminada con éxito', data: { id } });
}));

export default router;
