import pool from '../config/database.js';

export class Horario {
    constructor(data) {
        this.id = data.id || null;
        this.tipo = data.tipo || 'grupal';
        this.actividad_id = data.actividad_id;
        this.lugar_id = data.lugar_id;
        this.profesor_id = data.profesor_id || null;
        this.dia_semana = data.dia_semana;
        this.hora_inicio = data.hora_inicio;
        this.hora_fin = data.hora_fin;
        this.activo = data.activo !== undefined ? data.activo : true;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.deleted_at = data.deleted_at || null;
        
        // Joined data
        this.actividad_nombre = data.actividad_nombre || null;
        this.lugar_nombre = data.lugar_nombre || null;
        this.profesor_nombre = data.profesor_nombre || null;
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT h.*, a.nombre as actividad_nombre, l.nombre as lugar_nombre, p.nombre_completo as profesor_nombre
            FROM Horario h
            JOIN Actividad a ON h.actividad_id = a.id
            JOIN Lugar l ON h.lugar_id = l.id
            LEFT JOIN Practicante p ON h.profesor_id = p.id
            WHERE h.deleted_at IS NULL
        `;
        const params = [];

        if (filters.actividad_id && filters.actividad_id !== '') {
            sql += ' AND h.actividad_id = ?';
            params.push(filters.actividad_id);
        }
        if (filters.lugar_id && filters.lugar_id !== '') {
            sql += ' AND h.lugar_id = ?';
            params.push(filters.lugar_id);
        }
        if (filters.dia_semana !== undefined && filters.dia_semana !== '') {
            sql += ' AND h.dia_semana = ?';
            params.push(filters.dia_semana);
        }
        if (filters.activo !== undefined && filters.activo !== '') {
            sql += ' AND h.activo = ?';
            const isActive = (filters.activo === true || filters.activo === 'true' || filters.activo == 1);
            params.push(isActive ? 1 : 0);
        }
        if (filters.tipo && filters.tipo !== '') {
            sql += ' AND h.tipo = ?';
            params.push(filters.tipo);
        }

        sql += ' ORDER BY h.dia_semana, h.hora_inicio';

        const [rows] = await pool.execute(sql, params);
        return rows.map(row => new Horario(row));
    }

    static async findById(id) {
        const sql = `
            SELECT h.*, a.nombre as actividad_nombre, l.nombre as lugar_nombre, p.nombre_completo as profesor_nombre
            FROM Horario h
            JOIN Actividad a ON h.actividad_id = a.id
            JOIN Lugar l ON h.lugar_id = l.id
            LEFT JOIN Practicante p ON h.profesor_id = p.id
            WHERE h.id = ? AND h.deleted_at IS NULL
        `;
        const [rows] = await pool.execute(sql, [id]);
        return rows.length ? new Horario(rows[0]) : null;
    }

    static async create(data, userId = null) {
        const sql = `
            INSERT INTO Horario (tipo, actividad_id, lugar_id, profesor_id, dia_semana, hora_inicio, hora_fin, activo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.tipo || 'grupal',
            data.actividad_id,
            data.lugar_id,
            data.profesor_id || null,
            data.dia_semana,
            data.hora_inicio,
            data.hora_fin,
            data.activo !== undefined ? data.activo : 1
        ];

        const [result] = await pool.execute(sql, values);
        const newHorario = await this.findById(result.insertId);

        if (newHorario && userId) {
            await this.recordHistory(newHorario.id, 'CREATE', null, newHorario, userId);
        }

        return newHorario;
    }

    static async update(id, data, userId = null) {
        const current = await this.findById(id);
        if (!current) return null;

        const sql = `
            UPDATE Horario 
            SET tipo = ?, actividad_id = ?, lugar_id = ?, profesor_id = ?, dia_semana = ?, hora_inicio = ?, hora_fin = ?, activo = ?
            WHERE id = ? AND deleted_at IS NULL
        `;
        const values = [
            data.tipo || current.tipo,
            data.actividad_id || current.actividad_id,
            data.lugar_id || current.lugar_id,
            data.profesor_id !== undefined ? data.profesor_id : current.profesor_id,
            data.dia_semana !== undefined ? data.dia_semana : current.dia_semana,
            data.hora_inicio || current.hora_inicio,
            data.hora_fin || current.hora_fin,
            data.activo !== undefined ? data.activo : current.activo,
            id
        ];

        await pool.execute(sql, values);
        const updated = await this.findById(id);

        if (updated && userId) {
            await this.recordHistory(id, 'UPDATE', current, updated, userId);
        }

        return updated;
    }

    static async delete(id, userId = null) {
        const current = await this.findById(id);
        if (!current) return false;

        const sql = 'UPDATE Horario SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        await pool.execute(sql, [id]);

        if (userId) {
            await this.recordHistory(id, 'DELETE', current, null, userId);
        }

        return true;
    }

    static async recordHistory(horarioId, accion, datosAnteriores, datosNuevos, usuarioId) {
        const sql = `
            INSERT INTO HistorialHorario (horario_id, accion, datos_anteriores, datos_nuevos, usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        await pool.execute(sql, [
            horarioId,
            accion,
            datosAnteriores ? JSON.stringify(datosAnteriores) : null,
            datosNuevos ? JSON.stringify(datosNuevos) : null,
            usuarioId
        ]);
    }

    static async getHistory(id) {
        const sql = `
            SELECT h.*, u.email as usuario_email
            FROM HistorialHorario h
            LEFT JOIN User u ON h.usuario_id = u.id
            WHERE h.horario_id = ?
            ORDER BY h.fecha DESC
        `;
        const [rows] = await pool.execute(sql, [id]);
        return rows.map(row => ({
            ...row,
            datos_anteriores: row.datos_anteriores ? JSON.parse(row.datos_anteriores) : null,
            datos_nuevos: row.datos_nuevos ? JSON.parse(row.datos_nuevos) : null
        }));
    }

    toJSON() {
        return {
            id: this.id,
            tipo: this.tipo,
            actividad_id: this.actividad_id,
            lugar_id: this.lugar_id,
            profesor_id: this.profesor_id,
            dia_semana: this.dia_semana,
            hora_inicio: this.hora_inicio,
            hora_fin: this.hora_fin,
            activo: this.activo,
            actividad_nombre: this.actividad_nombre,
            lugar_nombre: this.lugar_nombre,
            profesor_nombre: this.profesor_nombre,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default Horario;
