import pool from '../config/database.js';

/**
 * Lugar Model
 */
export class Lugar {
    constructor(data) {
        this.id = data.id || null;
        this.nombre = data.nombre;
        this.direccion = data.direccion || null;
        this.parent_direccion = data.parent_direccion || null; 
        
        // Fix: If parent_id is null, parent_activo should be true so it doesn't deactivate the main location
        this.parent_activo = (data.parent_id && data.parent_activo !== undefined) ? !!data.parent_activo : true;
        
        // Inheritance logic
        this.activo = data.activo !== undefined ? !!data.activo : true;
        this.activo_efectivo = this.activo && this.parent_activo;

        this.cobra_cuota_social = data.cobra_cuota_social !== undefined ? !!data.cobra_cuota_social : false;
        this.parent_cobra_cuota_social = data.parent_cobra_cuota_social !== undefined ? !!data.parent_cobra_cuota_social : false;
        
        // Social fee is always from parent if it exists
        this.cobra_cuota_social_efectivo = data.parent_id ? this.parent_cobra_cuota_social : this.cobra_cuota_social;
        
        this.cuota_social_general = data.cuota_social_general !== undefined ? data.cuota_social_general : 0.00;
        this.parent_cuota_general = data.parent_cuota_general !== undefined ? data.parent_cuota_general : 0.00;
        this.cuota_social_general_efectiva = data.parent_id ? this.parent_cuota_general : this.cuota_social_general;

        this.cuota_social_descuento = data.cuota_social_descuento !== undefined ? data.cuota_social_descuento : 0.00;
        this.parent_cuota_descuento = data.parent_cuota_descuento !== undefined ? data.parent_cuota_descuento : 0.00;
        this.cuota_social_descuento_efectiva = data.parent_id ? this.parent_cuota_descuento : this.cuota_social_descuento;

        this.costo_tarifa = data.costo_tarifa !== undefined ? data.costo_tarifa : 0.00;
        this.tipo_tarifa = data.tipo_tarifa || 'por_hora';
        this.parent_id = data.parent_id || null;
        this.parent_nombre = data.parent_nombre || null; 
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    /**
     * Create a new lugar
     * @param {Object} data - Lugar data
     * @returns {Promise<Lugar>}
     */
    static async create(data) {
        const sql = `
            INSERT INTO Lugar (
                nombre, direccion, activo, cobra_cuota_social, cuota_social_general, cuota_social_descuento, costo_tarifa, tipo_tarifa, parent_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [
            data.nombre, 
            data.direccion || null, 
            data.activo !== undefined ? data.activo : true,
            data.parent_id ? false : (data.cobra_cuota_social !== undefined ? data.cobra_cuota_social : false),
            data.parent_id ? 0 : (data.cuota_social_general !== undefined ? data.cuota_social_general : 0.00),
            data.parent_id ? 0 : (data.cuota_social_descuento !== undefined ? data.cuota_social_descuento : 0.00),
            data.parent_id ? (data.costo_tarifa !== undefined ? data.costo_tarifa : 0.00) : 0,
            data.parent_id ? (data.tipo_tarifa || 'por_hora') : 'por_hora',
            data.parent_id || null
        ];
        const [result] = await pool.execute(sql, values);
        return await this.findById(result.insertId);
    }

    /**
     * Find lugar by ID
     * @param {number} id - Lugar ID
     * @returns {Promise<Lugar|null>}
     */
    static async findById(id) {
        const sql = `
            SELECT l1.*, 
                   l2.nombre as parent_nombre, 
                   l2.direccion as parent_direccion,
                   l2.activo as parent_activo,
                   l2.cobra_cuota_social as parent_cobra_cuota_social,
                   l2.cuota_social_general as parent_cuota_general,
                   l2.cuota_social_descuento as parent_cuota_descuento
            FROM Lugar l1 
            LEFT JOIN Lugar l2 ON l1.parent_id = l2.id 
            WHERE l1.id = ?
        `;
        const [rows] = await pool.execute(sql, [id]);
        return rows.length > 0 ? new Lugar(rows[0]) : null;
    }

    /**
     * Find all lugares
     * @returns {Promise<Lugar[]>}
     */
    static async findAll() {
        const sql = `
            SELECT l1.*, 
                   l2.nombre as parent_nombre, 
                   l2.direccion as parent_direccion,
                   l2.activo as parent_activo,
                   l2.cobra_cuota_social as parent_cobra_cuota_social,
                   l2.cuota_social_general as parent_cuota_general,
                   l2.cuota_social_descuento as parent_cuota_descuento
            FROM Lugar l1 
            LEFT JOIN Lugar l2 ON l1.parent_id = l2.id 
            ORDER BY l2.nombre ASC, l1.nombre ASC
        `;
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
        const allowedFields = ['nombre', 'direccion', 'activo', 'cobra_cuota_social', 'cuota_social_general', 'cuota_social_descuento', 'costo_tarifa', 'tipo_tarifa', 'parent_id'];
        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (data.hasOwnProperty(field)) {
                updates.push(`${field} = ?`);
                // If it's a child, we force some fields to null/0
                if (data.parent_id) {
                    if (['cobra_cuota_social', 'cuota_social_general', 'cuota_social_descuento'].includes(field)) {
                        values.push(field === 'cobra_cuota_social' ? false : 0);
                        continue;
                    }
                } else {
                    // If it's a parent, we force tarifa to 0
                    if (['costo_tarifa'].includes(field)) {
                        values.push(0);
                        continue;
                    }
                }
                values.push(data[field] !== undefined ? data[field] : null);
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
            parent_direccion: this.parent_direccion,
            direccion_mostrada: this.direccion || this.parent_direccion,
            activo: this.activo,
            activo_efectivo: this.activo_efectivo,
            cobra_cuota_social: this.cobra_cuota_social_efectivo,
            cuota_social_general: this.cuota_social_general_efectiva,
            cuota_social_descuento: this.cuota_social_descuento_efectiva,
            costo_tarifa: this.costo_tarifa,
            tipo_tarifa: this.tipo_tarifa,
            parent_id: this.parent_id,
            parent_nombre: this.parent_nombre,
            parent_activo: this.parent_activo,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default Lugar;
