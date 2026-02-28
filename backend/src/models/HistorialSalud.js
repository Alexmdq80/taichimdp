import pool from '../config/database.js';

/**
 * HistorialSalud Model (for FR-006)
 */
export class HistorialSalud {
  constructor(data) {
    this.id = data.id || null;
    this.practicante_id = data.practicante_id;
    this.campo_modificado = data.campo_modificado;
    this.valor_anterior = data.valor_anterior || null;
    this.valor_nuevo = data.valor_nuevo || null;
    this.fecha_modificacion = data.fecha_modificacion || null;
    this.deleted_at = data.deleted_at || null;
  }

  /**
   * Create a new health history record and record audit log
   * @param {Object} data - HistorialSalud data
   * @param {number} [userId] - User ID
   * @returns {Promise<HistorialSalud>}
   */
  static async create(data, userId = null) {
    const sql = `
      INSERT INTO HistorialSalud (practicante_id, campo_modificado, valor_anterior, valor_nuevo)
      VALUES (?, ?, ?, ?)
    `;
    
    const values = [
      data.practicante_id,
      data.campo_modificado,
      data.valor_anterior || null,
      data.valor_nuevo || null
    ];

    const [result] = await pool.execute(sql, values);
    const newRecord = await this.findById(result.insertId);

    if (newRecord) {
        await this.recordAudit(newRecord.id, 'CREATE', null, newRecord.toJSON(), userId);
    }

    return newRecord;
  }

  /**
   * Find by ID (only non-deleted)
   * @param {number} id - HistorialSalud ID
   * @returns {Promise<HistorialSalud|null>}
   */
  static async findById(id) {
    const sql = 'SELECT * FROM HistorialSalud WHERE id = ? AND deleted_at IS NULL';
    const [rows] = await pool.execute(sql, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return new HistorialSalud(rows[0]);
  }

  /**
   * Find all health history records for a practicante (only non-deleted)
   * @param {number} practicante_id - Practicante ID
   * @returns {Promise<HistorialSalud[]>}
   */
  static async findByPracticanteId(practicante_id) {
    const sql = `
      SELECT * FROM HistorialSalud 
      WHERE practicante_id = ? AND deleted_at IS NULL
      ORDER BY fecha_modificacion DESC
    `;
    const [rows] = await pool.execute(sql, [practicante_id]);
    return rows.map(row => new HistorialSalud(row));
  }

  /**
   * Soft delete health history record and audit
   * @param {number} id - HistorialSalud ID
   * @param {number} [userId] - User ID
   * @returns {Promise<boolean>}
   */
  static async delete(id, userId = null) {
      const currentData = await this.findById(id);
      if (!currentData) return false;

      const sql = 'UPDATE HistorialSalud SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL';
      const [result] = await pool.execute(sql, [id]);

      if (result.affectedRows > 0) {
          await this.recordAudit(id, 'DELETE', currentData.toJSON(), null, userId);
          return true;
      }
      return false;
  }

  /**
   * Record audit log
   * @param {number} id - HistorialSalud ID
   * @param {string} action - Action performed
   * @param {Object|null} oldData - Data before change
   * @param {Object|null} newData - Data after change
   * @param {number|null} userId - User ID
   * @returns {Promise<void>}
   */
  static async recordAudit(id, action, oldData, newData, userId) {
      const sql = `
          INSERT INTO AuditHistorialSalud (
              historial_salud_id, accion, datos_anteriores, datos_nuevos, usuario_id
          ) VALUES (?, ?, ?, ?, ?)
      `;

      const values = [
          id,
          action,
          oldData ? JSON.stringify(oldData) : null,
          newData ? JSON.stringify(newData) : null,
          userId
      ];

      await pool.execute(sql, values);
  }

  /**
   * Convert to plain object
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      practicante_id: this.practicante_id,
      campo_modificado: this.campo_modificado,
      valor_anterior: this.valor_anterior,
      valor_nuevo: this.valor_nuevo,
      fecha_modificacion: this.fecha_modificacion,
      deleted_at: this.deleted_at
    };
  }
}

export default HistorialSalud;
