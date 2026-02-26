import pool from '../config/database.js';

/**
 * Abono Model
 */
export class Abono {
    constructor(data) {
        this.id = data.id || null;
        this.practicante_id = data.practicante_id;
        this.tipo_abono_id = data.tipo_abono_id;
        this.fecha_inicio = data.fecha_inicio;
        this.fecha_vencimiento = data.fecha_vencimiento;
        this.mes_abono = data.mes_abono || null;
        this.lugar_id = data.lugar_id || null;
        this.lugar_nombre = data.lugar_nombre || null; // From join
        this.estado = data.estado || 'activo';
        this.cantidad = data.cantidad || 1;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    /**
     * Create a new abono
     * @param {Object} data - Abono data
     * @param {Object} [connection] - Database connection for transactions
     * @returns {Promise<Abono>}
     */
    static async create(data, connection = null) {
        const sql = `
            INSERT INTO Abono (
                practicante_id, tipo_abono_id, fecha_inicio, fecha_vencimiento, mes_abono, lugar_id, estado, cantidad
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.practicante_id,
            data.tipo_abono_id,
            data.fecha_inicio,
            data.fecha_vencimiento,
            data.mes_abono || null,
            data.lugar_id || null,
            data.estado || 'activo',
            data.cantidad || 1
        ];

        const executor = connection || pool;
        const [result] = await executor.execute(sql, values);
        return await this.findById(result.insertId, connection);
    }

    /**
     * Find abono by ID
     * @param {number} id - Abono ID
     * @param {Object} [connection] - Database connection
     * @returns {Promise<Abono|null>}
     */
    static async findById(id, connection = null) {
        const sql = `
            SELECT a.*, l.nombre as lugar_nombre
            FROM Abono a
            LEFT JOIN Lugar l ON a.lugar_id = l.id
            WHERE a.id = ?
        `;
        const executor = connection || pool;
        const [rows] = await executor.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        return new Abono(rows[0]);
    }

    /**
     * Find active abono for a practicante
     * @param {number} practicanteId - Practicante ID
     * @param {Object} [connection] - Database connection
     * @returns {Promise<Abono|null>}
     */
    static async findActiveByPracticanteId(practicanteId, connection = null) {
        const sql = `
            SELECT a.*, l.nombre as lugar_nombre
            FROM Abono a
            LEFT JOIN Lugar l ON a.lugar_id = l.id
            WHERE a.practicante_id = ? AND a.estado = 'activo' 
            AND a.fecha_vencimiento >= CURDATE()
            ORDER BY a.fecha_vencimiento DESC LIMIT 1
        `;
        const executor = connection || pool;
        const [rows] = await executor.execute(sql, [practicanteId]);

        if (rows.length === 0) {
            return null;
        }

        return new Abono(rows[0]);
    }

    /**
     * Update abono status
     * @param {number} id - Abono ID
     * @param {string} estado - New status
     * @param {Object} [connection] - Database connection
     * @returns {Promise<boolean>}
     */
    static async updateStatus(id, estado, connection = null) {
        const sql = 'UPDATE Abono SET estado = ? WHERE id = ?';
        const executor = connection || pool;
        const [result] = await executor.execute(sql, [estado, id]);
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
            tipo_abono_id: this.tipo_abono_id,
            fecha_inicio: this.fecha_inicio,
            fecha_vencimiento: this.fecha_vencimiento,
            mes_abono: this.mes_abono,
            lugar_id: this.lugar_id,
            lugar_nombre: this.lugar_nombre,
            estado: this.estado,
            cantidad: this.cantidad,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default Abono;
