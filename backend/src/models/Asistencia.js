import pool from '../config/database.js';

export class Asistencia {
    constructor(data) {
        this.id = data.id || null;
        this.practicante_id = data.practicante_id;
        this.clase_id = data.clase_id;
        this.asistio = data.asistio !== undefined ? data.asistio : true;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;

        // Joined data
        this.practicante_nombre = data.practicante_nombre || null;
    }

    /**
     * Obtiene la lista de asistencia para una clase específica.
     */
    static async findByClase(claseId) {
        const sql = `
            SELECT a.*, p.nombre_completo as practicante_nombre
            FROM Asistencia a
            JOIN Practicante p ON a.practicante_id = p.id
            WHERE a.clase_id = ?
        `;
        const [rows] = await pool.execute(sql, [claseId]);
        return rows.map(row => new Asistencia(row));
    }

    /**
     * Registra o actualiza la asistencia de un practicante.
     */
    static async upsert(data) {
        const sql = `
            INSERT INTO Asistencia (practicante_id, clase_id, asistio)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE asistio = VALUES(asistio), updated_at = CURRENT_TIMESTAMP
        `;
        const [result] = await pool.execute(sql, [
            data.practicante_id,
            data.clase_id,
            data.asistio !== undefined ? data.asistio : 1
        ]);
        return result.affectedRows > 0;
    }

    /**
     * Elimina un registro de asistencia.
     */
    static async delete(practicanteId, claseId) {
        const sql = 'DELETE FROM Asistencia WHERE practicante_id = ? AND clase_id = ?';
        const [result] = await pool.execute(sql, [practicanteId, claseId]);
        return result.affectedRows > 0;
    }

    /**
     * Obtiene los practicantes elegibles para una clase (con abono activo).
     * Esto es clave para mostrar la lista de "presentismo".
     */
    static async getEligiblePracticantes(actividadId, lugarId, fecha) {
        const sql = `
            SELECT p.id, p.nombre_completo, ab.id as abono_id, ta.nombre as abono_nombre
            FROM Practicante p
            JOIN Abono ab ON p.id = ab.practicante_id
            JOIN TipoAbono ta ON ab.tipo_abono_id = ta.id
            WHERE ab.estado = 'activo'
            AND ab.deleted_at IS NULL
            AND ab.lugar_id = ?
            AND ab.fecha_inicio <= ?
            AND ab.fecha_vencimiento >= ?
            AND (ta.categoria = 'clase' OR ta.categoria = 'cuota_club')
            ORDER BY p.nombre_completo ASC
        `;
        const [rows] = await pool.execute(sql, [lugarId, fecha, fecha]);
        return rows;
    }
}

export default Asistencia;
