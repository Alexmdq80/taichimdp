import pool from '../config/database.js';

export class Clase {
    constructor(data) {
        this.id = data.id || null;
        this.horario_id = data.horario_id || null;
        this.actividad_id = data.actividad_id;
        this.lugar_id = data.lugar_id;
        this.fecha = data.fecha;
        this.hora = data.hora;
        this.hora_fin = data.hora_fin;
        this.descripcion = data.descripcion || null;
        this.usuario_id = data.usuario_id || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.deleted_at = data.deleted_at || null;

        // Joined data
        this.actividad_nombre = data.actividad_nombre || null;
        this.lugar_nombre = data.lugar_nombre || null;
        this.asistentes_count = data.asistentes_count || 0;
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT c.*, a.nombre as actividad_nombre, l.nombre as lugar_nombre,
                   (SELECT COUNT(*) FROM Asistencia WHERE clase_id = c.id AND asistio = 1) as asistentes_count
            FROM Clase c
            JOIN Actividad a ON c.actividad_id = a.id
            JOIN Lugar l ON c.lugar_id = l.id
            WHERE c.deleted_at IS NULL
        `;
        const params = [];

        if (filters.fecha_inicio && filters.fecha_inicio !== '') {
            sql += ' AND c.fecha >= ?';
            params.push(filters.fecha_inicio);
        }
        if (filters.fecha_fin && filters.fecha_fin !== '') {
            sql += ' AND c.fecha <= ?';
            params.push(filters.fecha_fin);
        }
        if (filters.actividad_id && filters.actividad_id !== '') {
            sql += ' AND c.actividad_id = ?';
            params.push(filters.actividad_id);
        }
        if (filters.lugar_id && filters.lugar_id !== '') {
            sql += ' AND c.lugar_id = ?';
            params.push(filters.lugar_id);
        }

        sql += ' ORDER BY c.fecha DESC, c.hora DESC';

        const [rows] = await pool.execute(sql, params);
        return rows.map(row => new Clase(row));
    }

    static async findById(id) {
        const sql = `
            SELECT c.*, a.nombre as actividad_nombre, l.nombre as lugar_nombre,
                   (SELECT COUNT(*) FROM Asistencia WHERE clase_id = c.id AND asistio = 1) as asistentes_count
            FROM Clase c
            JOIN Actividad a ON c.actividad_id = a.id
            JOIN Lugar l ON c.lugar_id = l.id
            WHERE c.id = ? AND c.deleted_at IS NULL
        `;
        const [rows] = await pool.execute(sql, [id]);
        return rows.length ? new Clase(rows[0]) : null;
    }

    static async create(data) {
        const sql = `
            INSERT INTO Clase (horario_id, actividad_id, lugar_id, fecha, hora, hora_fin, descripcion, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.horario_id || null,
            data.actividad_id,
            data.lugar_id,
            data.fecha,
            data.hora,
            data.hora_fin,
            data.descripcion || null,
            data.usuario_id || null
        ];

        const [result] = await pool.execute(sql, values);
        return await this.findById(result.insertId);
    }

    static async delete(id) {
        const sql = 'UPDATE Clase SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        const [result] = await pool.execute(sql, [id]);
        return result.affectedRows > 0;
    }

    toJSON() {
        return {
            id: this.id,
            horario_id: this.horario_id,
            actividad_id: this.actividad_id,
            lugar_id: this.lugar_id,
            fecha: this.fecha,
            hora: this.hora,
            hora_fin: this.hora_fin,
            descripcion: this.descripcion,
            actividad_nombre: this.actividad_nombre,
            lugar_nombre: this.lugar_nombre,
            asistentes_count: this.asistentes_count,
            created_at: this.created_at
        };
    }
}

export default Clase;
