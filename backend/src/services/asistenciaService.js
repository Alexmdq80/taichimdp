import Horario from '../models/Horario.js';
import Clase from '../models/Clase.js';
import pool from '../config/database.js';

export class AsistenciaService {
    /**
     * Genera instancias de Clase para un rango de fechas basado en los Horarios activos.
     * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
     * @param {string} endDate - Fecha fin (YYYY-MM-DD)
     * @param {number} userId - ID del usuario que realiza la acción
     */
    static async generarClasesDesdeHorarios(startDate, endDate, userId) {
        const horarios = await Horario.findAll({ activo: true });
        const start = new Date(startDate);
        const end = new Date(endDate);
        const clasesGeneradas = [];

        // Obtener clases existentes en ese rango para evitar duplicados
        const clasesExistentes = await Clase.findAll({ fecha_inicio: startDate, fecha_fin: endDate });
        const existenteMap = new Set(clasesExistentes.map(c => `${c.horario_id}_${c.fecha}`));

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const diaSemana = d.getDay(); // 0-6 (Dom-Sab)
            const fechaStr = d.toISOString().split('T')[0];

            const horariosDelDia = horarios.filter(h => h.dia_semana === diaSemana);

            for (const h of horariosDelDia) {
                // Verificar si ya existe la clase para ese horario y fecha
                if (!existenteMap.has(`${h.id}_${fechaStr}`)) {
                    const nuevaClase = await Clase.create({
                        horario_id: h.id,
                        actividad_id: h.actividad_id,
                        lugar_id: h.lugar_id,
                        fecha: fechaStr,
                        hora: h.hora_inicio,
                        hora_fin: h.hora_fin,
                        usuario_id: userId,
                        descripcion: `Generada automáticamente desde horario semanal`
                    });
                    clasesGeneradas.push(nuevaClase);
                }
            }
        }

        return clasesGeneradas;
    }
}

export default AsistenciaService;
