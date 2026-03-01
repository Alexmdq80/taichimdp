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
        this.es_costo = data.es_costo !== undefined ? !!data.es_costo : false;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.deleted_at = data.deleted_at || null;
    }

    static async findAll(filters = {}) {
        let sql = `
            SELECT ps.*, p.nombre_completo, l.nombre as lugar_nombre
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

        if (filters.es_costo !== undefined) {
            sql += ' AND ps.es_costo = ?';
            params.push(filters.es_costo ? 1 : 0);
        }

        sql += ' ORDER BY ps.fecha_pago DESC';

        const [rows] = await pool.execute(sql, params);
        return rows.map(row => new PagoSocio(row));
    }

    static async findById(id) {
        const sql = `
            SELECT ps.*
            FROM PagoSocio ps
            WHERE ps.id = ? AND ps.deleted_at IS NULL
        `;
        const [rows] = await pool.execute(sql, [id]);
        return rows.length ? new PagoSocio(rows[0]) : null;
    }

    static async create(data, userId = null) {
        const sql = `
            INSERT INTO PagoSocio (socio_id, monto, fecha_pago, mes_abono, fecha_vencimiento, observaciones, usuario_id, es_costo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await pool.execute(sql, [
            data.socio_id,
            data.monto || 0.00,
            data.fecha_pago,
            data.mes_abono,
            data.fecha_vencimiento,
            data.observaciones || null,
            userId,
            data.es_costo !== undefined ? data.es_costo : false
        ]);
        
        const newPago = await this.findById(result.insertId);
        if (newPago) {
            await this.recordHistory(newPago.id, 'CREATE', null, newPago.toJSON(), userId);
        }
        return newPago;
    }

    static async delete(id, userId = null) {
        const current = await this.findById(id);
        if (!current) return false;

        const sql = 'UPDATE PagoSocio SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?';
        const [result] = await pool.execute(sql, [id]);
        
        if (result.affectedRows > 0) {
            await this.recordHistory(id, 'DELETE', current.toJSON(), null, userId);
            return true;
        }
        return false;
    }

    static async recordHistory(pagoSocioId, action, oldData, newData, userId) {
        const sql = `
            INSERT INTO HistorialPagoSocio (pago_socio_id, accion, datos_anteriores, datos_nuevos, usuario_id)
            VALUES (?, ?, ?, ?, ?)
        `;
        await pool.execute(sql, [
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
            es_costo: this.es_costo,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default PagoSocio;
