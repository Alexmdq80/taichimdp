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
        const sql = `
            INSERT INTO TipoAbono (
                nombre, descripcion, duracion_dias, precio
            ) VALUES (?, ?, ?, ?)
        `;

        const values = [
            data.nombre,
            data.descripcion !== undefined ? data.descripcion : null,
            data.duracion_dias !== undefined ? data.duracion_dias : null,
            data.precio !== undefined ? data.precio : null
        ];

        const [result] = await pool.execute(sql, values);
        const newTipoAbono = await this.findById(result.insertId);

        if (newTipoAbono) {
            await this.recordHistory(newTipoAbono.id, 'CREATE', null, newTipoAbono.toJSON(), userId);
        }

        return newTipoAbono;
    }

    /**
     * Find tipo de abono by ID (only non-deleted)
     * @param {number} id - TipoAbono ID
     * @param {Object} [connection] - Database connection
     * @returns {Promise<TipoAbono|null>}
     */
    static async findById(id, connection = null) {
        const sql = 'SELECT * FROM TipoAbono WHERE id = ? AND deleted_at IS NULL';
        const executor = connection || pool;
        const [rows] = await executor.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        return new TipoAbono(rows[0]);
    }

    /**
     * Find all tipos de abono (only non-deleted)
     * @returns {Promise<TipoAbono[]>}
     */
    static async findAll() {
        const sql = 'SELECT * FROM TipoAbono WHERE deleted_at IS NULL ORDER BY nombre ASC';
        const [rows] = await pool.execute(sql);
        return rows.map(row => new TipoAbono(row));
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

        const allowedFields = ['nombre', 'descripcion', 'duracion_dias', 'precio'];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (data.hasOwnProperty(field)) {
                updates.push(`${field} = ?`);
                values.push(data[field] !== undefined ? data[field] : null);
            }
        }

        if (updates.length === 0) {
            return currentData;
        }

        values.push(id);
        const sql = `UPDATE TipoAbono SET ${updates.join(', ')} WHERE id = ?`;

        await pool.execute(sql, values);
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
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at
        };
    }
}

export default TipoAbono;
