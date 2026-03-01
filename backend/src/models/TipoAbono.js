import pool from '../config/database.js';

/**
 * TipoAbono Model
 */
export class TipoAbono {
    constructor(data) {
        this.id = data.id || null;
        this.nombre = data.nombre;
        this.descripcion = data.descripcion !== undefined ? data.descripcion : null;
        this.duracion_dias = data.duracion_dias !== undefined ? data.duracion_dias : null;
        this.precio = data.precio !== undefined ? data.precio : null;
        this.clases_por_semana = data.clases_por_semana !== undefined ? data.clases_por_semana : 1;
        this.max_personas = data.max_personas !== undefined ? data.max_personas : 1;
        this.categoria = data.categoria || 'grupal';
        this.lugar_id = data.lugar_id || null;
        this.lugar_nombre = data.lugar_nombre || null; // From join
        this.horarios = data.horarios || []; // Array of horario IDs
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.deleted_at = data.deleted_at || null;
    }

    /**
     * Create a new tipo de abono and record history
     * @param {Object} data - TipoAbono data
     * @param {number} userId - ID of the user creating it
     * @returns {Promise<TipoAbono>}
     */
    static async create(data, userId = null) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const sql = `
                INSERT INTO TipoAbono (
                    nombre, descripcion, duracion_dias, precio, clases_por_semana, max_personas, categoria, lugar_id
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;

            const values = [
                data.nombre,
                data.descripcion !== undefined ? data.descripcion : null,
                data.duracion_dias !== undefined ? data.duracion_dias : null,
                data.precio !== undefined ? data.precio : null,
                data.clases_por_semana !== undefined ? data.clases_por_semana : 1,
                data.max_personas !== undefined ? data.max_personas : 1,
                data.categoria || 'grupal',
                data.lugar_id || null
            ];

            const [result] = await connection.execute(sql, values);
            const tipoAbonoId = result.insertId;

            // Associate with schedules if provided
            if (data.horarios && Array.isArray(data.horarios) && data.horarios.length > 0) {
                const scheduleSql = `INSERT INTO TipoAbono_Horario (tipo_abono_id, horario_id) VALUES (?, ?)`;
                for (const horarioId of data.horarios) {
                    await connection.execute(scheduleSql, [tipoAbonoId, horarioId]);
                }
            }

            await connection.commit();
            const newTipoAbono = await this.findById(tipoAbonoId);

            if (newTipoAbono) {
                await this.recordHistory(newTipoAbono.id, 'CREATE', null, newTipoAbono.toJSON(), userId);
            }

            return newTipoAbono;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Find tipo de abono by ID (only non-deleted)
     * @param {number} id - TipoAbono ID
     * @param {Object} [connection] - Database connection
     * @returns {Promise<TipoAbono|null>}
     */
    static async findById(id, connection = null) {
        const sql = `
            SELECT ta.*, l.nombre as lugar_nombre,
            (SELECT JSON_ARRAYAGG(horario_id) FROM TipoAbono_Horario WHERE tipo_abono_id = ta.id) as horarios_ids
            FROM TipoAbono ta
            LEFT JOIN Lugar l ON ta.lugar_id = l.id
            WHERE ta.id = ? AND ta.deleted_at IS NULL
        `;
        const executor = connection || pool;
        const [rows] = await executor.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        const data = rows[0];
        // Parse JSON array from DB if exists
        data.horarios = typeof data.horarios_ids === 'string' ? JSON.parse(data.horarios_ids) : (data.horarios_ids || []);
        
        return new TipoAbono(data);
    }

    /**
     * Find all tipos de abono (only non-deleted)
     * @returns {Promise<TipoAbono[]>}
     */
    static async findAll() {
        const sql = `
            SELECT ta.*, l.nombre as lugar_nombre,
            (SELECT JSON_ARRAYAGG(horario_id) FROM TipoAbono_Horario WHERE tipo_abono_id = ta.id) as horarios_ids
            FROM TipoAbono ta
            LEFT JOIN Lugar l ON ta.lugar_id = l.id
            WHERE ta.deleted_at IS NULL
            ORDER BY ta.nombre ASC
        `;
        const [rows] = await pool.execute(sql);
        return rows.map(row => {
            row.horarios = typeof row.horarios_ids === 'string' ? JSON.parse(row.horarios_ids) : (row.horarios_ids || []);
            return new TipoAbono(row);
        });
    }

    /**
     * Update tipo de abono and record history
     * @param {number} id - TipoAbono ID
     * @param {Object} data - Updated data
     * @param {number} userId - ID of the user making the update
     * @returns {Promise<TipoAbono|null>}
     */
    static async update(id, data, userId = null) {
        const currentData = await this.findById(id);
        if (!currentData) return null;

        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const allowedFields = ['nombre', 'descripcion', 'duracion_dias', 'precio', 'clases_por_semana', 'max_personas', 'categoria', 'lugar_id'];
            const updates = [];
            const values = [];

            for (const field of allowedFields) {
                if (data.hasOwnProperty(field)) {
                    updates.push(`${field} = ?`);
                    values.push(data[field] !== undefined ? data[field] : null);
                }
            }

            if (updates.length > 0) {
                values.push(id);
                const sql = `UPDATE TipoAbono SET ${updates.join(', ')} WHERE id = ?`;
                await connection.execute(sql, values);
            }

            // Update schedules if provided
            if (data.horarios && Array.isArray(data.horarios)) {
                // Remove existing associations
                await connection.execute('DELETE FROM TipoAbono_Horario WHERE tipo_abono_id = ?', [id]);
                
                // Add new associations
                if (data.horarios.length > 0) {
                    const scheduleSql = `INSERT INTO TipoAbono_Horario (tipo_abono_id, horario_id) VALUES (?, ?)`;
                    for (const horarioId of data.horarios) {
                        await connection.execute(scheduleSql, [id, horarioId]);
                    }
                }
            }

            await connection.commit();
            const updatedTipoAbono = await this.findById(id);

            if (updatedTipoAbono) {
                await this.recordHistory(
                    id,
                    'UPDATE',
                    currentData.toJSON(),
                    updatedTipoAbono.toJSON(),
                    userId
                );
            }

            return updatedTipoAbono;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Soft delete tipo de abono and record history
     * @param {number} id - TipoAbono ID
     * @param {number} userId - ID of the user performing the deletion
     * @returns {Promise<boolean>}
     */
    static async delete(id, userId = null) {
        const currentData = await this.findById(id);
        if (!currentData) return false;

        const sql = 'UPDATE TipoAbono SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        const [result] = await pool.execute(sql, [id]);

        if (result.affectedRows > 0) {
            await this.recordHistory(id, 'DELETE', currentData.toJSON(), null, userId);
            return true;
        }

        return false;
    }

    /**
     * Record modification history
     * @param {number} tipoAbonoId - TipoAbono ID
     * @param {string} action - Action performed (CREATE, UPDATE, DELETE)
     * @param {Object|null} oldData - Data before change
     * @param {Object|null} newData - Data after change
     * @param {number|null} userId - ID of the user who performed the action
     * @returns {Promise<void>}
     */
    static async recordHistory(tipoAbonoId, action, oldData, newData, userId) {
        const sql = `
            INSERT INTO HistorialTipoAbono (
                tipo_abono_id, accion, datos_anteriores, datos_nuevos, usuario_id
            ) VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            tipoAbonoId,
            action,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            userId
        ];

        await pool.execute(sql, values);
    }

    /**
     * Get history of a tipo de abono
     * @param {number} id - TipoAbono ID
     * @returns {Promise<Array>}
     */
    static async getHistory(id) {
        const sql = `
            SELECT h.*, u.email as usuario_email
            FROM HistorialTipoAbono h
            LEFT JOIN User u ON h.usuario_id = u.id
            WHERE h.tipo_abono_id = ?
            ORDER BY h.fecha DESC
        `;
        const [rows] = await pool.execute(sql, [id]);
        return rows.map(row => ({
            ...row,
            datos_anteriores: typeof row.datos_anteriores === 'string' ? JSON.parse(row.datos_anteriores) : row.datos_anteriores,
            datos_nuevos: typeof row.datos_nuevos === 'string' ? JSON.parse(row.datos_nuevos) : row.datos_nuevos
        }));
    }

    /**
     * Convert to plain object
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            descripcion: this.descripcion,
            duracion_dias: this.duracion_dias,
            precio: this.precio,
            clases_por_semana: this.clases_por_semana,
            max_personas: this.max_personas,
            categoria: this.categoria,
            lugar_id: this.lugar_id,
            lugar_nombre: this.lugar_nombre,
            horarios: this.horarios,
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at
        };
    }
}

export default TipoAbono;
