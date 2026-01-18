import pool from '../config/database.js';

/**
 * Practicante Model
 */
export class Practicante {
    constructor(data) {
        this.id = data.id || null;
        this.nombre_completo = data.nombre_completo;
        this.fecha_nacimiento = data.fecha_nacimiento || null;
        this.genero = data.genero || null;
        this.telefono = data.telefono || null;
        this.email = data.email || null;
        this.direccion = data.direccion || null;
        this.condiciones_medicas = data.condiciones_medicas || null;
        this.medicamentos = data.medicamentos || null;
        this.limitaciones_fisicas = data.limitaciones_fisicas || null;
        this.alergias = data.alergias || null;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
    }

    /**
     * Create a new practicante
     * @param {Object} data - Practicante data
     * @returns {Promise<Practicante>}
     */
    static async create(data) {
        const sql = `
      INSERT INTO Practicante (
        nombre_completo, fecha_nacimiento, genero, telefono, email,
        direccion, condiciones_medicas, medicamentos, limitaciones_fisicas, alergias
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            data.nombre_completo,
            data.fecha_nacimiento || null,
            data.genero || null,
            data.telefono || null,
            data.email || null,
            data.direccion || null,
            data.condiciones_medicas || null,
            data.medicamentos || null,
            data.limitaciones_fisicas || null,
            data.alergias || null
        ];

        const [result] = await pool.execute(sql, values);
        return await this.findById(result.insertId);
    }

    /**
     * Find practicante by ID
     * @param {number} id - Practicante ID
     * @returns {Promise<Practicante|null>}
     */
    static async findById(id) {
        const sql = 'SELECT * FROM Practicante WHERE id = ?';
        const [rows] = await pool.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        return new Practicante(rows[0]);
    }

    /**
     * Find all practicantes with optional search
     * @param {Object} options - Search options
     * @param {string} options.search - Search term (nombre, telefono, email)
     * @param {number} options.page - Page number
     * @param {number} options.limit - Results per page
     * @returns {Promise<Object>} - { data: Practicante[], pagination: {...} }
     */
    static async findAll(options = {}) {
        const { search = '', page = 1, limit = 50 } = options;

        // Validate and convert to integers
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 50;
        const offset = (pageNum - 1) * limitNum;

        // Build WHERE clause
        let whereClause = '';
        const searchParams = [];

        if (search && search.trim() !== '') {
            whereClause = ' WHERE (nombre_completo LIKE ? OR IFNULL(telefono, "") LIKE ? OR IFNULL(email, "") LIKE ?)';
            const searchTerm = `%${search.trim()}%`;
            searchParams.push(searchTerm, searchTerm, searchTerm);
        }

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM Practicante${whereClause}`;
        const [countRows] = await pool.execute(countSql, searchParams);
        const total = countRows[0]?.total || 0;

        // Get paginated results
        // Note: LIMIT and OFFSET must be numbers, not placeholders in MySQL2
        const sql = `SELECT * FROM Practicante${whereClause} ORDER BY nombre_completo ASC LIMIT ${limitNum} OFFSET ${offset}`;

        const [rows] = await pool.execute(sql, searchParams);
        const practicantes = rows.map(row => new Practicante(row));

        return {
            data: practicantes,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        };
    }

    /**
     * Update practicante
     * @param {number} id - Practicante ID
     * @param {Object} data - Updated data
     * @returns {Promise<Practicante|null>}
     */
    static async update(id, data) {
        const allowedFields = [
            'nombre_completo', 'fecha_nacimiento', 'genero', 'telefono', 'email',
            'direccion', 'condiciones_medicas', 'medicamentos', 'limitaciones_fisicas', 'alergias'
        ];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (data.hasOwnProperty(field)) {
                updates.push(`${field} = ?`);
                values.push(data[field] || null);
            }
        }

        if (updates.length === 0) {
            return await this.findById(id);
        }

        values.push(id);
        const sql = `UPDATE Practicante SET ${updates.join(', ')} WHERE id = ?`;

        await pool.execute(sql, values);
        return await this.findById(id);
    }

    /**
     * Delete practicante
     * @param {number} id - Practicante ID
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        const sql = 'DELETE FROM Practicante WHERE id = ?';
        const [result] = await pool.execute(sql, [id]);
        return result.affectedRows > 0;
    }

    /**
     * Check if practicante has related records
     * @param {number} id - Practicante ID
     * @returns {Promise<boolean>}
     */
    static async hasRelatedRecords(id) {
        const sql = `
      SELECT 
        (SELECT COUNT(*) FROM Abono WHERE practicante_id = ?) as abonos,
        (SELECT COUNT(*) FROM Pago WHERE practicante_id = ?) as pagos,
        (SELECT COUNT(*) FROM Asistencia WHERE practicante_id = ?) as asistencias
    `;
        const [rows] = await pool.execute(sql, [id, id, id]);
        const counts = rows[0];
        return counts.abonos > 0 || counts.pagos > 0 || counts.asistencias > 0;
    }

    /**
     * Convert to plain object
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            nombre_completo: this.nombre_completo,
            fecha_nacimiento: this.fecha_nacimiento,
            genero: this.genero,
            telefono: this.telefono,
            email: this.email,
            direccion: this.direccion,
            condiciones_medicas: this.condiciones_medicas,
            medicamentos: this.medicamentos,
            limitaciones_fisicas: this.limitaciones_fisicas,
            alergias: this.alergias,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }
}

export default Practicante;
