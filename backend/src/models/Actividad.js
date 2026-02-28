import pool from '../config/database.js';

/**
 * Actividad Model
 */
export class Actividad {
    constructor(data) {
        this.id = data.id || null;
        this.nombre = data.nombre;
        this.descripcion = data.descripcion || null;
        this.activo = data.activo !== undefined ? !!data.activo : true;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.deleted_at = data.deleted_at || null;
    }

    /**
     * Create a new actividad and record history
     * @param {Object} data - Actividad data
     * @param {number} userId - ID of the user creating it
     * @returns {Promise<Actividad>}
     */
    static async create(data, userId = null) {
        const sql = `
            INSERT INTO Actividad (
                nombre, descripcion, activo
            ) VALUES (?, ?, ?)
        `;
        const values = [
            data.nombre, 
            data.descripcion || null, 
            data.activo !== undefined ? data.activo : true
        ];
        const [result] = await pool.execute(sql, values);
        const newActividad = await this.findById(result.insertId);

        if (newActividad) {
            await this.recordHistory(newActividad.id, 'CREATE', null, newActividad.toJSON(), userId);
        }

        return newActividad;
    }

    /**
     * Find actividad by ID (only non-deleted)
     * @param {number} id - Actividad ID
     * @returns {Promise<Actividad|null>}
     */
    static async findById(id) {
        const sql = `
            SELECT * FROM Actividad WHERE id = ? AND deleted_at IS NULL
        `;
        const [rows] = await pool.execute(sql, [id]);
        return rows.length > 0 ? new Actividad(rows[0]) : null;
    }

    /**
     * Find all actividades (only non-deleted)
     * @returns {Promise<Actividad[]>}
     */
    static async findAll() {
        const sql = `
            SELECT * FROM Actividad WHERE deleted_at IS NULL ORDER BY nombre ASC
        `;
        const [rows] = await pool.execute(sql);
        return rows.map(row => new Actividad(row));
    }

    /**
     * Update actividad and record history
     * @param {number} id - Actividad ID
     * @param {Object} data - Updated data
     * @param {number} userId - ID of the user making the update
     * @returns {Promise<Actividad|null>}
     */
    static async update(id, data, userId = null) {
        const currentData = await this.findById(id);
        if (!currentData) return null;

        const allowedFields = ['nombre', 'descripcion', 'activo'];
        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (data.hasOwnProperty(field)) {
                updates.push(`${field} = ?`);
                values.push(data[field] !== undefined ? data[field] : null);
            }
        }

        if (updates.length === 0) return currentData;

        values.push(id);
        const sql = `UPDATE Actividad SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`;
        await pool.execute(sql, values);
        
        const updatedActividad = await this.findById(id);

        if (updatedActividad) {
            await this.recordHistory(
                id,
                'UPDATE',
                currentData.toJSON(),
                updatedActividad.toJSON(),
                userId
            );
        }

        return updatedActividad;
    }

    /**
     * Soft delete actividad and record history
     * @param {number} id - Actividad ID
     * @param {number} userId - ID of the user performing the deletion
     * @returns {Promise<boolean>}
     */
    static async delete(id, userId = null) {
        const currentData = await this.findById(id);
        if (!currentData) return false;

        const sql = 'UPDATE Actividad SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL';
        const [result] = await pool.execute(sql, [id]);

        if (result.affectedRows > 0) {
            await this.recordHistory(id, 'DELETE', currentData.toJSON(), null, userId);
            return true;
        }

        return false;
    }

    /**
     * Record modification history
     * @param {number} actividadId - Actividad ID
     * @param {string} action - Action performed (CREATE, UPDATE, DELETE)
     * @param {Object|null} oldData - Data before change
     * @param {Object|null} newData - Data after change
     * @param {number|null} userId - ID of the user who performed the action
     * @returns {Promise<void>}
     */
    static async recordHistory(actividadId, action, oldData, newData, userId) {
        const sql = `
            INSERT INTO HistorialActividad (
                actividad_id, accion, datos_anteriores, datos_nuevos, usuario_id
            ) VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            actividadId,
            action,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            userId
        ];

        await pool.execute(sql, values);
    }

    /**
     * Get history of a actividad
     * @param {number} id - Actividad ID
     * @returns {Promise<Array>}
     */
    static async getHistory(id) {
        const sql = `
            SELECT h.*, u.email as usuario_email
            FROM HistorialActividad h
            LEFT JOIN User u ON h.usuario_id = u.id
            WHERE h.actividad_id = ?
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
            activo: this.activo,
            created_at: this.created_at,
            updated_at: this.updated_at,
            deleted_at: this.deleted_at
        };
    }
}

export default Actividad;
