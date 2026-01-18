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
  }

  /**
   * Create a new health history record
   * @param {Object} data - HistorialSalud data
   * @returns {Promise<HistorialSalud>}
   */
  static async create(data) {
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
    return await this.findById(result.insertId);
  }

  /**
   * Find by ID
   * @param {number} id - HistorialSalud ID
   * @returns {Promise<HistorialSalud|null>}
   */
  static async findById(id) {
    const sql = 'SELECT * FROM HistorialSalud WHERE id = ?';
    const [rows] = await pool.execute(sql, [id]);
    
    if (rows.length === 0) {
      return null;
    }
    
    return new HistorialSalud(rows[0]);
  }

  /**
   * Find all health history records for a practicante
   * @param {number} practicante_id - Practicante ID
   * @returns {Promise<HistorialSalud[]>}
   */
  static async findByPracticanteId(practicante_id) {
    const sql = `
      SELECT * FROM HistorialSalud 
      WHERE practicante_id = ? 
      ORDER BY fecha_modificacion DESC
    `;
    const [rows] = await pool.execute(sql, [practicante_id]);
    return rows.map(row => new HistorialSalud(row));
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
      fecha_modificacion: this.fecha_modificacion
    };
  }
}

export default HistorialSalud;
