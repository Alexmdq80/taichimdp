import Horario from '../models/Horario.js';
import Clase from '../models/Clase.js';

export class AsistenciaService {
    /**
     * Genera instancias de Clase para un rango de fechas basado en los Horarios activos.
     * @param {string} startDate - Fecha inicio (YYYY-MM-DD)
     * @param {string} endDate - Fecha fin (YYYY-MM-DD)
     * @param {number} userId - ID del usuario que realiza la acción
     */
    static async generarClasesDesdeHorarios(startDate, endDate, userId) {
        console.log(`Generating classes from ${startDate} to ${endDate} for user ${userId}`);
        const horarios = await Horario.findAll({ activo: true });
        console.log(`Found ${horarios.length} active schedules`);
        
        // Use parts to avoid UTC timezone shifts
        const [sy, sm, sd] = startDate.split('-').map(Number);
        const [ey, em, ed] = endDate.split('-').map(Number);
        
        const start = new Date(sy, sm - 1, sd);
        const end = new Date(ey, em - 1, ed);
        const clasesGeneradas = [];

        // Obtener clases existentes en ese rango para evitar duplicados
        const clasesExistentes = await Clase.findAll({ fecha_inicio: startDate, fecha_fin: endDate });
        console.log(`Found ${clasesExistentes.length} existing classes in range`);
        
        const existenteMap = new Set(clasesExistentes.map(c => {
            // Asegurar que la fecha sea string YYYY-MM-DD
            let f = c.fecha;
            if (f instanceof Date) {
                const y = f.getFullYear();
                const m = String(f.getMonth() + 1).padStart(2, '0');
                const d = String(f.getDate()).padStart(2, '0');
                f = `${y}-${m}-${d}`;
            } else if (typeof f === 'string') {
                f = f.split('T')[0];
            }
            return `${c.horario_id}_${f}`;
        }));

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const diaSemana = d.getDay(); // 0-6 (Dom-Sab)
            
            // Format YYYY-MM-DD manually to avoid UTC issues
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const fechaStr = `${yyyy}-${mm}-${dd}`;

            const horariosDelDia = horarios.filter(h => h.dia_semana === diaSemana);

            for (const h of horariosDelDia) {
                const key = `${h.id}_${fechaStr}`;
                if (!existenteMap.has(key)) {
                    console.log(`Creating class for schedule ${h.id} on ${fechaStr}`);
                    const nuevaClase = await Clase.create({
                        horario_id: h.id,
                        tipo: h.tipo,
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

        console.log(`Successfully generated ${clasesGeneradas.length} classes`);
        return clasesGeneradas;
    }
}

export default AsistenciaService;
