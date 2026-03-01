import pool from '../config/database.js';

/**
 * Pago Model
 */
export class Pago {
    constructor(data) {
        this.id = data.id || null;
        this.practicante_id = data.practicante_id;
        this.abono_id = data.abono_id;
        this.mes_abono = data.mes_abono || null;
        this.lugar_id = data.lugar_id || null;
        this.fecha = data.fecha || new Date().toISOString().split('T')[0];
        this.monto = data.monto;
        this.metodo_pago = data.metodo_pago || null;
        this.notas = data.notas || null;
        this.tipo_abono_nombre = data.tipo_abono_nombre || null; 
        this.practicante_nombre = data.practicante_nombre || null; 
        this.categoria = data.categoria || null; 
        this.lugar_nombre = data.lugar_nombre || null; 
        this.fecha_vencimiento = data.fecha_vencimiento || null; 
        this.horarios_ids = data.horarios_ids || []; 
        this.deleted_at = data.deleted_at || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    /**
     * Create a new payment and record history
     * @param {Object} data - Pago data
     * @param {Object} [connection] - Database connection for transactions
     * @param {number} [userId] - User ID
     * @returns {Promise<Pago>}
     */
    static async create(data, connection = null, userId = null) {
        const sql = `
            INSERT INTO Pago (
                practicante_id, abono_id, mes_abono, lugar_id, fecha, monto, metodo_pago, notas
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const values = [
            data.practicante_id,
            data.abono_id,
            data.mes_abono || null,
            data.lugar_id || null,
            data.fecha,
            data.monto,
            data.metodo_pago || null,
            data.notas || null
        ];

        const executor = connection || pool;
        const [result] = await executor.execute(sql, values);
        const newPago = await this.findById(result.insertId, connection);

        if (newPago) {
            await this.recordHistory(newPago.id, 'CREATE', null, newPago.toJSON(), userId, executor);
        }

        return newPago;
    }

    /**
     * Find all payments
     * @param {Object} [filters] - Optional filters
     * @returns {Promise<Pago[]>}
     */
    static async findAll(filters = {}) {
        let sql = `
            SELECT p.*, ta.nombre as tipo_abono_nombre, ta.categoria, pr.nombre_completo as practicante_nombre,
                   a.fecha_vencimiento, l.nombre as lugar_nombre,
                   (SELECT JSON_ARRAYAGG(horario_id) FROM TipoAbono_Horario WHERE tipo_abono_id = ta.id) as schedules
            FROM Pago p
            JOIN Abono a ON p.abono_id = a.id
            JOIN TipoAbono ta ON a.tipo_abono_id = ta.id
            JOIN Practicante pr ON p.practicante_id = pr.id
            LEFT JOIN Lugar l ON p.lugar_id = l.id
            WHERE p.deleted_at IS NULL
        `;
        const params = [];

        if (filters.search) {
            sql += ' AND (pr.nombre_completo LIKE ? OR ta.nombre LIKE ?)';
            params.push(`%${filters.search}%`, `%${filters.search}%`);
        }

        if (filters.categoria) {
            sql += ' AND ta.categoria = ?';
            params.push(filters.categoria);
        }

        sql += ' ORDER BY p.fecha DESC, p.created_at DESC';

        const [rows] = await pool.execute(sql, params);
        return rows.map(row => {
            const rowData = { ...row };
            rowData.horarios_ids = typeof row.schedules === 'string' ? JSON.parse(row.schedules) : (row.schedules || []);
            return new Pago(rowData);
        });
    }

    /**
     * Find payment by ID
     * @param {number} id - Pago ID
     * @param {Object} [connection] - Database connection
     * @returns {Promise<Pago|null>}
     */
    static async findById(id, connection = null) {
        const sql = `
            SELECT p.*, ta.nombre as tipo_abono_nombre, ta.categoria, pr.nombre_completo as practicante_nombre,
                   a.fecha_vencimiento, l.nombre as lugar_nombre,
                   (SELECT JSON_ARRAYAGG(horario_id) FROM TipoAbono_Horario WHERE tipo_abono_id = ta.id) as schedules
            FROM Pago p
            JOIN Abono a ON p.abono_id = a.id
            JOIN TipoAbono ta ON a.tipo_abono_id = ta.id
            JOIN Practicante pr ON p.practicante_id = pr.id
            LEFT JOIN Lugar l ON p.lugar_id = l.id
            WHERE p.id = ? AND p.deleted_at IS NULL
        `;
        const executor = connection || pool;
        const [rows] = await executor.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        const row = rows[0];
        row.horarios_ids = typeof row.schedules === 'string' ? JSON.parse(row.schedules) : (row.schedules || []);
        return new Pago(row);
    }

    /**
     * Find all payments for a practicante
     * @param {number} practicanteId - Practicante ID
     * @returns {Promise<Pago[]>}
     */
    static async findByPracticanteId(practicanteId) {
        const sql = `
            SELECT p.*, ta.nombre as tipo_abono_nombre, ta.categoria, a.fecha_vencimiento, l.nombre as lugar_nombre,
                   (SELECT JSON_ARRAYAGG(horario_id) FROM TipoAbono_Horario WHERE tipo_abono_id = ta.id) as schedules
            FROM Pago p
            JOIN Abono a ON p.abono_id = a.id
            JOIN TipoAbono ta ON a.tipo_abono_id = ta.id
            LEFT JOIN Lugar l ON p.lugar_id = l.id
            WHERE p.practicante_id = ? AND p.deleted_at IS NULL
            ORDER BY p.fecha DESC
        `;
        const [rows] = await pool.execute(sql, [practicanteId]);
        return rows.map(row => {
            const rowData = { ...row };
            rowData.horarios_ids = typeof row.schedules === 'string' ? JSON.parse(row.schedules) : (row.schedules || []);
            return new Pago(rowData);
        });
    }

    /**
     * Delete payment (Soft Delete) and record history
     * @param {number} id - Pago ID
     * @param {Object} [connection] - Database connection
     * @param {number} [userId] - User ID
     * @returns {Promise<boolean>}
     */
    static async delete(id, connection = null, userId = null) {
        const executor = connection || pool;
        const currentData = await this.findById(id, executor);
        if (!currentData) return false;

        const sql = 'UPDATE Pago SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        const [result] = await executor.execute(sql, [id]);
        
        if (result.affectedRows > 0) {
            await this.recordHistory(id, 'DELETE', currentData.toJSON(), null, userId, executor);
            return true;
        }
        return false;
    }

    /**
     * Record modification history
     * @param {number} pagoId - Pago ID
     * @param {string} action - Action performed (CREATE, UPDATE, DELETE)
     * @param {Object|null} oldData - Data before change
     * @param {Object|null} newData - Data after change
     * @param {number|null} userId - ID of the user who performed the action
     * @param {Object} [connection] - Database connection
     * @returns {Promise<void>}
     */
    static async recordHistory(pagoId, action, oldData, newData, userId, connection = null) {
        const sql = `
            INSERT INTO HistorialPago (
                pago_id, accion, datos_anteriores, datos_nuevos, usuario_id
            ) VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            pagoId,
            action,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            userId
        ];

        const executor = connection || pool;
        await executor.execute(sql, values);
    }

    /**
     * Get history of a payment
     * @param {number} id - Pago ID
     * @returns {Promise<Array>}
     */
    static async getHistory(id) {
        const sql = `
            SELECT h.*, u.email as usuario_email
            FROM HistorialPago h
            LEFT JOIN User u ON h.usuario_id = u.id
            WHERE h.pago_id = ?
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
            practicante_id: this.practicante_id,
            abono_id: this.abono_id,
            mes_abono: this.mes_abono,
            lugar_id: this.lugar_id,
            fecha: this.fecha,
            monto: this.monto,
            metodo_pago: this.metodo_pago,
            notas: this.notas,
            tipo_abono_nombre: this.tipo_abono_nombre,
            practicante_nombre: this.practicante_nombre,
            categoria: this.categoria,
            lugar_nombre: this.lugar_nombre,
            fecha_vencimiento: this.fecha_vencimiento,
            horarios_ids: this.horarios_ids,
            deleted_at: this.deleted_at,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default Pago;
