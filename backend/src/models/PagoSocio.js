import pool from '../config/database.js';

/**
 * PagoSocio Model
 */
export class PagoSocio {
    constructor(data) {
        this.id = data.id || null;
        this.socio_id = data.socio_id;
        this.monto = data.monto || 0.00;
        this.fecha_pago = data.fecha_pago;
        this.mes_abono = data.mes_abono;
        this.fecha_vencimiento = data.fecha_vencimiento;
        this.observaciones = data.observaciones || null;
        this.usuario_id = data.usuario_id || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.deleted_at = data.deleted_at || null;

        // Dynamic fields from JOINs
        this.es_profesor = data.es_profesor !== undefined ? !!data.es_profesor : false;
        this.nombre_completo = data.nombre_completo || null;
        this.lugar_nombre = data.lugar_nombre || null;
    }

    static async existsForSocioAndMonth(socioId, mesAbono, excludeId = null) {
        let sql = 'SELECT id FROM PagoSocio WHERE socio_id = ? AND mes_abono = ? AND deleted_at IS NULL';
        const params = [socioId, mesAbono];
        
        if (excludeId) {
            sql += ' AND id != ?';
            params.push(excludeId);
        }
        
        const [rows] = await pool.execute(sql, params);
        return rows.length > 0;
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT ps.*, p.nombre_completo, l.nombre as lugar_nombre, p.es_profesor
            FROM PagoSocio ps
            JOIN Socio s ON ps.socio_id = s.id
            JOIN Practicante p ON s.practicante_id = p.id
            JOIN Lugar l ON s.lugar_id = l.id
            WHERE ps.deleted_at IS NULL
        `;
        const params = [];

        if (filters.socio_id) {
            sql += ' AND ps.socio_id = ?';
            params.push(filters.socio_id);
        }

        sql += ' ORDER BY ps.fecha_pago DESC';

        const [rows] = await pool.execute(sql, params);
        return rows.map(row => new PagoSocio(row));
    }

    static async findById(id, connection = null) {
        const sql = `
            SELECT ps.*, p.es_profesor
            FROM PagoSocio ps
            JOIN Socio s ON ps.socio_id = s.id
            JOIN Practicante p ON s.practicante_id = p.id
            WHERE ps.id = ? AND ps.deleted_at IS NULL
        `;
        const executor = connection || pool;
        const [rows] = await executor.execute(sql, [id]);
        return rows.length ? new PagoSocio(rows[0]) : null;
    }

    static async create(data, connection = null, userId = null) {
        const sql = `
            INSERT INTO PagoSocio (socio_id, monto, fecha_pago, mes_abono, fecha_vencimiento, observaciones, usuario_id)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        const executor = connection || pool;
        const [result] = await executor.execute(sql, [
            data.socio_id,
            data.monto || 0.00,
            data.fecha_pago,
            data.mes_abono,
            data.fecha_vencimiento,
            data.observaciones || null,
            userId
        ]);
        
        const newPago = await this.findById(result.insertId, executor);
        if (newPago) {
            await this.recordHistory(newPago.id, 'CREATE', null, newPago.toJSON(), userId, executor);
        }
        return newPago;
    }

    static async update(id, data, connection = null, userId = null) {
        const executor = connection || pool;
        const current = await this.findById(id, executor);
        if (!current) return null;

        const sql = `
            UPDATE PagoSocio 
            SET monto = ?, fecha_pago = ?, mes_abono = ?, fecha_vencimiento = ?, observaciones = ?
            WHERE id = ? AND deleted_at IS NULL
        `;
        
        const [result] = await executor.execute(sql, [
            data.monto !== undefined ? data.monto : current.monto,
            data.fecha_pago !== undefined ? data.fecha_pago : current.fecha_pago,
            data.mes_abono !== undefined ? data.mes_abono : current.mes_abono,
            data.fecha_vencimiento !== undefined ? data.fecha_vencimiento : current.fecha_vencimiento,
            data.observaciones !== undefined ? data.observaciones : current.observaciones,
            id
        ]);

        if (result.affectedRows > 0) {
            const updated = await this.findById(id, executor);
            await this.recordHistory(id, 'UPDATE', current.toJSON(), updated.toJSON(), userId, executor);
            return updated;
        }
        return null;
    }

    static async delete(id, connection = null, userId = null) {
        const executor = connection || pool;
        const current = await this.findById(id, executor);
        if (!current) return false;

        const sql = 'UPDATE PagoSocio SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        const [result] = await executor.execute(sql, [id]);
        
        if (result.affectedRows > 0) {
            await this.recordHistory(id, 'DELETE', current.toJSON(), null, userId, executor);
            return true;
        }
        return false;
    }

    static async recordHistory(pagoSocioId, action, oldData, newData, userId, connection = null) {
        const sql = `
            INSERT INTO HistorialPagoSocio (pago_socio_id, accion, datos_anteriores, datos_nuevos, usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        const executor = connection || pool;
        await executor.execute(sql, [
            pagoSocioId,
            action,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            userId
        ]);
    }

    toJSON() {
        // Asegurar que las fechas sean YYYY-MM-DD para el frontend
        const formatDate = (date) => {
            if (!date) return null;
            if (date instanceof Date) return date.toISOString().split('T')[0];
            return date.includes('T') ? date.split('T')[0] : date;
        };

        return {
            id: this.id,
            socio_id: this.socio_id,
            monto: this.monto,
            fecha_pago: formatDate(this.fecha_pago),
            mes_abono: this.mes_abono,
            fecha_vencimiento: formatDate(this.fecha_vencimiento),
            observaciones: this.observaciones,
            usuario_id: this.usuario_id,
            es_profesor: this.es_profesor,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default PagoSocio;
