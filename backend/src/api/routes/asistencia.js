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

    // Permitir sobrescribir el estado para chequear elegibilidad (útil para el frontend al cambiar el selector)
    if (req.query.estado) {
        clase.estado = req.query.estado;
    }

    // 1. Obtener elegibles
    const elegibles = await Asistencia.getEligiblePracticantes(clase);

    // 2. Obtener quienes ya tienen asistencia marcada
    const asistenciaActual = await Asistencia.findByClase(id);
    const asistieronMap = new Map(asistenciaActual.map(a => [a.practicante_id, a.asistio]));

    // 3. Cruzar datos y obtener conteo semanal
    const data = await Promise.all(elegibles.map(async (p) => {
        const asistio = asistieronMap.has(p.id) ? asistieronMap.get(p.id) : false;
        
        // Solo contamos si no ha marcado asistencia en ESTA clase específica todavía (para evitar doble conteo si ya asistió)
        // O si ya marcó, restamos 1 para el mensaje de advertencia si fuera necesario, 
        // pero es más simple obtener el conteo actual excluyendo esta clase si queremos saber el estado PREVIO.
        const weeklyCount = await Asistencia.getWeeklyAttendanceCount(p.id, p.abono_id, clase.fecha);
        
        return {
            ...p,
            asistio,
            asistencias_esta_semana: weeklyCount
        };
    }));

    res.json({ data });
}));

/**
 * POST /api/asistencia/clases/:id/practicantes
 * Updates attendance for multiple practitioners at once for a specific class.
 */
router.post('/clases/:id/practicantes', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { updates } = req.body;

    const clase = await Clase.findById(id);
    if (!clase) throw new AppError('Clase no encontrada', 404);

    // RESTRICTION: Check state based on class type
    if (clase.tipo === 'grupal') {
        if (clase.estado !== 'realizada') {
            throw new AppError('Solo se puede marcar asistencia en clases grupales con estado "Realizada"', 400);
        }
    } else {
        if (clase.estado !== 'programada' && clase.estado !== 'realizada') {
            throw new AppError('Solo se puede marcar asistencia en clases particulares/compartidas con estado "Programada" o "Realizada"', 400);
        }
    }

    if (updates && Array.isArray(updates)) {
        for (const u of updates) {
            await Asistencia.upsert({
                clase_id: id,
                practicante_id: u.practicante_id,
                asistio: u.asistio
            });
        }
    }

    res.json({ message: 'Asistencia actualizada con éxito' });
}));

/**
 * PUT /api/asistencia/clases/:id
 * Updates class information (estado, observaciones, etc.)
 */
router.put('/clases/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const data = req.body;

    const clase = await Clase.findById(id);
    if (!clase) throw new AppError('Clase no encontrada', 404);

    // Clean dates/times to avoid ISO strings or invalid MySQL formats
    const cleanFecha = data.fecha ? (typeof data.fecha === 'string' && data.fecha.includes('T') ? data.fecha.split('T')[0] : data.fecha) : clase.fecha;
    const cleanHora = data.hora ? (typeof data.hora === 'string' && data.hora.length > 8 ? data.hora.substring(0, 8) : data.hora) : clase.hora;
    const cleanHoraFin = data.hora_fin ? (typeof data.hora_fin === 'string' && data.hora_fin.length > 8 ? data.hora_fin.substring(0, 8) : data.hora_fin) : clase.hora_fin;

    // RESTRICTION: Only allow marking as "realizada" if class date/time has passed
    if (data.estado === 'realizada') {
        const classDateTime = new Date(`${cleanFecha}T${cleanHora}`);
        const now = new Date();
        
        if (now < classDateTime) {
            throw new AppError('No se puede marcar la clase como realizada antes de su fecha y hora de inicio', 400);
        }
    }

    const updatedClase = await Clase.update(id, {
        tipo: data.tipo || clase.tipo,
        estado: data.estado || clase.estado,
        motivo_cancelacion: data.motivo_cancelacion !== undefined ? data.motivo_cancelacion : clase.motivo_cancelacion,
        observaciones: data.observaciones !== undefined ? data.observaciones : clase.observaciones,
        fecha: cleanFecha,
        hora: cleanHora,
        hora_fin: cleanHoraFin
    });

    res.json({ data: updatedClase.toJSON() });
}));

/**
 * POST /api/asistencia/clases/:id/registrar
 * Registra la asistencia de múltiples practicantes a la vez y actualiza el estado de la clase.
 * (This route is legacy/alternative, but let's keep it consistent).
 */
router.post('/clases/:id/registrar', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { asistencias, estado, observaciones, motivo_cancelacion } = req.body;

    const clase = await Clase.findById(id);
    if (!clase) throw new AppError('Clase no encontrada', 404);

    // 1. Validar si se está cambiando a "realizada"
    if (estado === 'realizada') {
        const classDateTime = new Date(`${clase.fecha}T${clase.hora}`);
        const now = new Date();
        if (now < classDateTime) {
            throw new AppError('No se puede marcar la clase como realizada antes de su fecha y hora de inicio', 400);
        }
    }

    // 2. Validar si se está marcando asistencia según el tipo y estado
    if (asistencias && asistencias.length > 0) {
        const targetEstado = estado || clase.estado;
        if (clase.tipo === 'grupal') {
            if (targetEstado !== 'realizada') {
                throw new AppError('Solo se puede marcar asistencia en clases grupales con estado "Realizada"', 400);
            }
        } else {
            if (targetEstado !== 'programada' && targetEstado !== 'realizada') {
                throw new AppError('Solo se puede marcar asistencia en clases particulares/compartidas con estado "Programada" o "Realizada"', 400);
            }
        }
    }

    // 3. Actualizar datos de la clase
    const updateData = {
        estado: estado || (asistencias && asistencias.length > 0 ? 'realizada' : clase.estado),
        observaciones: observaciones !== undefined ? observaciones : clase.observaciones,
        motivo_cancelacion: motivo_cancelacion !== undefined ? motivo_cancelacion : clase.motivo_cancelacion,
        fecha: clase.fecha,
        hora: clase.hora,
        hora_fin: clase.hora_fin
    };
    await Clase.update(id, updateData);

    // 4. Registrar asistencias
    if (asistencias && Array.isArray(asistencias)) {
        for (const a of asistencias) {
            await Asistencia.upsert({
                clase_id: id,
                practicante_id: a.practicante_id,
                asistio: a.asistio
            });
        }
    }

    res.json({ message: 'Asistencia y estado de clase actualizados con éxito' });
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
 * GET /api/asistencia/clases
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
 * GET /api/asistencia/clases/:id
 * Get specific session by ID
 */
router.get('/clases/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const clase = await Clase.findById(id);
    if (!clase) throw new AppError('Clase no encontrada', 404);
    res.json({ data: clase.toJSON() });
}));

/**
 * POST /api/asistencia/clases
 * Create a new specific session (instance)
 */
router.post('/clases', asyncHandler(async (req, res) => {
    const data = req.body;
    data.usuario_id = req.user.id;

    if (!data.actividad_id || !data.lugar_id || !data.fecha || !data.hora || !data.hora_fin) {
        throw new AppError('Todos los campos son obligatorios (actividad, lugar, fecha, hora inicio, hora fin)', 400);
    }

    // Clean data format
    if (typeof data.fecha === 'string' && data.fecha.includes('T')) data.fecha = data.fecha.split('T')[0];
    if (typeof data.hora === 'string' && data.hora.length > 8) data.hora = data.hora.substring(0, 8);
    if (typeof data.hora_fin === 'string' && data.hora_fin.length > 8) data.hora_fin = data.hora_fin.substring(0, 8);

    const clase = await Clase.create(data);

    // Si hay alumnos reservados (para clases particulares/compartidas), los registramos en la asistencia
    if (data.practicantes_reservados && Array.isArray(data.practicantes_reservados)) {
        for (const practicanteId of data.practicantes_reservados) {
            await Asistencia.upsert({
                clase_id: clase.id,
                practicante_id: practicanteId,
                asistio: 1
            });
        }
    }

    res.status(201).json({ data: clase.toJSON() });
}));

/**
 * DELETE /api/asistencia/clases/:id
 * Delete (soft-delete) a specific session
 */
router.delete('/clases/:id', asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const deleted = await Clase.delete(id);
    if (!deleted) throw new AppError('Clase no encontrada', 404);
    res.json({ message: 'Clase eliminada con éxito', data: { id } });
}));

export default router;
