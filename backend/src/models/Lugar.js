import pool from '../config/database.js';

/**
 * Lugar Model
 */
export class Lugar {
    constructor(data) {
        this.id = data.id || null;
        this.nombre = data.nombre;
        this.direccion = data.direccion || null;
        this.activo = data.activo !== undefined ? !!data.activo : true;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    /**
     * Create a new lugar
     * @param {Object} data - Lugar data
     * @returns {Promise<Lugar>}
     */
    static async create(data) {
        const sql = 'INSERT INTO Lugar (nombre, direccion, activo) VALUES (?, ?, ?)';
        const values = [data.nombre, data.direccion || null, data.activo !== undefined ? data.activo : true];
        const [result] = await pool.execute(sql, values);
        return await this.findById(result.insertId);
    }

    /**
     * Find lugar by ID
     * @param {number} id - Lugar ID
     * @returns {Promise<Lugar|null>}
     */
    static async findById(id) {
        const sql = 'SELECT * FROM Lugar WHERE id = ?';
        const [rows] = await pool.execute(sql, [id]);
        return rows.length > 0 ? new Lugar(rows[0]) : null;
    }

    /**
     * Find all lugares
     * @returns {Promise<Lugar[]>}
     */
    static async findAll() {
        const sql = 'SELECT * FROM Lugar ORDER BY nombre ASC';
        const [rows] = await pool.execute(sql);
        return rows.map(row => new Lugar(row));
    }

    /**
     * Update lugar
     * @param {number} id - Lugar ID
     * @param {Object} data - Updated data
     * @returns {Promise<Lugar|null>}
     */
    static async update(id, data) {
        const allowedFields = ['nombre', 'direccion', 'activo'];
        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (data.hasOwnProperty(field)) {
                updates.push(`${field} = ?`);
                values.push(data[field]);
            }
        }

        if (updates.length === 0) return await this.findById(id);

        values.push(id);
        const sql = `UPDATE Lugar SET ${updates.join(', ')} WHERE id = ?`;
        await pool.execute(sql, values);
        return await this.findById(id);
    }

    /**
     * Delete (Hard Delete for now)
     * @param {number} id - Lugar ID
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const sql = 'DELETE FROM Lugar WHERE id = ?';
        const [result] = await pool.execute(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Convert to plain object
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            direccion: this.direccion,
            activo: this.activo,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default Lugar;
