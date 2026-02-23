import pool from '../config/database.js';

/**
 * Pago Model
 */
export class Pago {
    constructor(data) {
        this.id = data.id || null;
        this.practicante_id = data.practicante_id;
        this.abono_id = data.abono_id;
        this.fecha = data.fecha || new Date().toISOString().split('T')[0];
        this.monto = data.monto;
        this.metodo_pago = data.metodo_pago || null;
        this.notas = data.notas || null;
        this.tipo_abono_nombre = data.tipo_abono_nombre || null; // New field from join
        this.practicante_nombre = data.practicante_nombre || null; // New field from join
        this.deleted_at = data.deleted_at || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    /**
     * Create a new payment
     * @param {Object} data - Pago data
     * @param {Object} [connection] - Database connection for transactions
     * @returns {Promise<Pago>}
     */
    static async create(data, connection = null) {
        const sql = `
            INSERT INTO Pago (
                practicante_id, abono_id, fecha, monto, metodo_pago, notas
            ) VALUES (?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.practicante_id,
            data.abono_id,
            data.fecha,
            data.monto,
            data.metodo_pago || null,
            data.notas || null
        ];

        const executor = connection || pool;
        const [result] = await executor.execute(sql, values);
        return await this.findById(result.insertId, connection);
    }

    /**
     * Find all payments
     * @param {Object} [filters] - Optional filters
     * @returns {Promise<Pago[]>}
     */
    static async findAll(filters = {}) {
        let sql = `
            SELECT p.*, ta.nombre as tipo_abono_nombre, pr.nombre_completo as practicante_nombre
            FROM Pago p
            JOIN Abono a ON p.abono_id = a.id
            JOIN TipoAbono ta ON a.tipo_abono_id = ta.id
            JOIN Practicante pr ON p.practicante_id = pr.id
            WHERE p.deleted_at IS NULL
        `;
        const params = [];

        if (filters.search) {
            sql += ' AND (pr.nombre_completo LIKE ? OR ta.nombre LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        sql += ' ORDER BY p.fecha DESC, p.created_at DESC';

        const [rows] = await pool.execute(sql, params);
        return rows.map(row => new Pago(row));
    }

    /**
     * Find payment by ID
     * @param {number} id - Pago ID
     * @param {Object} [connection] - Database connection
     * @returns {Promise<Pago|null>}
     */
    static async findById(id, connection = null) {
        const sql = `
            SELECT p.*, ta.nombre as tipo_abono_nombre, pr.nombre_completo as practicante_nombre
            FROM Pago p
            JOIN Abono a ON p.abono_id = a.id
            JOIN TipoAbono ta ON a.tipo_abono_id = ta.id
            JOIN Practicante pr ON p.practicante_id = pr.id
            WHERE p.id = ? AND p.deleted_at IS NULL
        `;
        const executor = connection || pool;
        const [rows] = await executor.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        return new Pago(rows[0]);
    }

    /**
     * Find all payments for a practicante
     * @param {number} practicanteId - Practicante ID
     * @returns {Promise<Pago[]>}
     */
    static async findByPracticanteId(practicanteId) {
        const sql = `
            SELECT p.*, ta.nombre as tipo_abono_nombre 
            FROM Pago p
            JOIN Abono a ON p.abono_id = a.id
            JOIN TipoAbono ta ON a.tipo_abono_id = ta.id
            WHERE p.practicante_id = ? AND p.deleted_at IS NULL
            ORDER BY p.fecha DESC
        `;
        const [rows] = await pool.execute(sql, [practicanteId]);
        return rows.map(row => new Pago(row));
    }

    /**
     * Delete payment (Soft Delete)
     * @param {number} id - Pago ID
     * @param {Object} [connection] - Database connection
     * @returns {Promise<boolean>}
     */
    static async delete(id, connection = null) {
        const sql = 'UPDATE Pago SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        const executor = connection || pool;
        const [result] = await executor.execute(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Convert to plain object
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            practicante_id: this.practicante_id,
            abono_id: this.abono_id,
            fecha: this.fecha,
            monto: this.monto,
            metodo_pago: this.metodo_pago,
            notas: this.notas,
            tipo_abono_nombre: this.tipo_abono_nombre, // New
            practicante_nombre: this.practicante_nombre, // New
            deleted_at: this.deleted_at,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default Pago;
