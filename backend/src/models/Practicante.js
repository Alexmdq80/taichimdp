import pool from '../config/database.js';

/**
 * Practicante Model
 */
export class Practicante {
    constructor(data) {
        this.id = data.id || null;
        this.user_id = data.user_id || null;
        this.es_profesor = data.es_profesor !== undefined ? !!data.es_profesor : false;
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
        this.deleted_at = data.deleted_at || null;
    }

    /**
     * Create a new practicante and record history
     * @param {Object} data - Practicante data
     * @param {number} userId - ID of the user creating it
     * @returns {Promise<Practicante>}
     */
    static async create(data, userId = null) {
        const sql = `
      INSERT INTO Practicante (
        user_id, es_profesor, nombre_completo, fecha_nacimiento, genero, telefono, email,
        direccion, condiciones_medicas, medicamentos, limitaciones_fisicas, alergias
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

        const values = [
            data.user_id || null,
            data.es_profesor !== undefined ? data.es_profesor : false,
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
        const newPracticante = await this.findById(result.insertId);

        if (newPracticante) {
            await this.recordHistory(newPracticante.id, 'CREATE', null, newPracticante.toJSON(), userId);
        }

        return newPracticante;
    }

    /**
     * Find practicante by ID (only non-deleted)
     * @param {number} id - Practicante ID
     * @param {Object} [connection] - Database connection
     * @returns {Promise<Practicante|null>}
     */
    static async findById(id, connection = null) {
        const sql = 'SELECT * FROM Practicante WHERE id = ? AND deleted_at IS NULL';
        const executor = connection || pool;
        const [rows] = await executor.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        return new Practicante(rows[0]);
    }

    /**
     * Find all practicantes with optional search (only non-deleted)
     * @param {Object} options - Search options
     * @param {string} options.search - Search term (nombre, telefono, email)
     * @param {number} options.page - Page number
     * @param {number} options.limit - Results per page
     * @param {boolean} options.es_profesor - Filter by teacher status
     * @returns {Promise<Object>} - { data: Practicante[], pagination: {...} }
     */
    static async findAll(options = {}) {
        const { search = '', page = 1, limit = 50, es_profesor } = options;

        // Validate and convert to integers
        const pageNum = parseInt(page, 10) || 1;
        const limitNum = parseInt(limit, 10) || 50;
        const offset = (pageNum - 1) * limitNum;

        // Build WHERE clause
        let whereClause = ' WHERE deleted_at IS NULL';
        const searchParams = [];

        if (search && search.trim() !== '') {
            whereClause += ' AND (nombre_completo LIKE ? OR IFNULL(telefono, "") LIKE ? OR IFNULL(email, "") LIKE ?)';
            const searchTerm = `%${search.trim()}%`;
            searchParams.push(searchTerm, searchTerm, searchTerm);
        }

        if (es_profesor !== undefined) {
            whereClause += ' AND es_profesor = ?';
            searchParams.push(es_profesor ? 1 : 0);
        }

        // Get total count
        const countSql = `SELECT COUNT(*) as total FROM Practicante${whereClause}`;
        const [countRows] = await pool.execute(countSql, searchParams);
        const total = countRows[0]?.total || 0;

        // Get paginated results
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

    static async findByUserId(userId) {
        const sql = 'SELECT * FROM Practicante WHERE user_id = ? AND deleted_at IS NULL';
        const [rows] = await pool.execute(sql, [userId]);
        return rows.length ? new Practicante(rows[0]) : null;
    }

    /**
     * Update practicante and record history
     * @param {number} id - Practicante ID
     * @param {Object} data - Updated data
     * @param {number} userId - ID of the user making the update
     * @returns {Promise<Practicante|null>}
     */
    static async update(id, data, userId = null) {
        const currentData = await this.findById(id);
        if (!currentData) return null;

        const allowedFields = [
            'nombre_completo', 'fecha_nacimiento', 'genero', 'telefono', 'email',
            'direccion', 'condiciones_medicas', 'medicamentos', 'limitaciones_fisicas', 'alergias',
            'user_id', 'es_profesor'
        ];

        const updates = [];
        const values = [];

        for (const field of allowedFields) {
            if (data.hasOwnProperty(field)) {
                updates.push(`${field} = ?`);
                values.push(data[field] === undefined ? null : data[field]);
            }
        }

        if (updates.length === 0) {
            return currentData;
        }

        values.push(id);
        const sql = `UPDATE Practicante SET ${updates.join(', ')} WHERE id = ? AND deleted_at IS NULL`;

        await pool.execute(sql, values);
        
        const updatedPracticante = await this.findById(id);

        if (updatedPracticante) {
            await this.recordHistory(
                id,
                'UPDATE',
                currentData.toJSON(),
                updatedPracticante.toJSON(),
                userId
            );
        }

        return updatedPracticante;
    }

    /**
     * Soft delete practicante and record history
     * @param {number} id - Practicante ID
     * @param {number} userId - ID of the user performing the deletion
     * @returns {Promise<boolean>}
     */
    static async delete(id, userId = null) {
        const currentData = await this.findById(id);
        if (!currentData) return false;

        const sql = 'UPDATE Practicante SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL';
        const [result] = await pool.execute(sql, [id]);

        if (result.affectedRows > 0) {
            await this.recordHistory(id, 'DELETE', currentData.toJSON(), null, userId);
            return true;
        }

        return false;
    }

    /**
     * Record modification history
     * @param {number} practicanteId - Practicante ID
     * @param {string} action - Action performed (CREATE, UPDATE, DELETE)
     * @param {Object|null} oldData - Data before change
     * @param {Object|null} newData - Data after change
     * @param {number|null} userId - ID of the user who performed the action
     * @returns {Promise<void>}
     */
    static async recordHistory(practicanteId, action, oldData, newData, userId) {
        const sql = `
            INSERT INTO HistorialPracticante (
                practicante_id, accion, datos_anteriores, datos_nuevos, usuario_id
            ) VALUES (?, ?, ?, ?, ?)
        `;

        const values = [
            practicanteId,
            action,
            oldData ? JSON.stringify(oldData) : null,
            newData ? JSON.stringify(newData) : null,
            userId
        ];

        await pool.execute(sql, values);
    }

    /**
     * Get history of a practicante
     * @param {number} id - Practicante ID
     * @returns {Promise<Array>}
     */
    static async getHistory(id) {
        const sql = `
            SELECT h.*, u.email as usuario_email
            FROM HistorialPracticante h
            LEFT JOIN User u ON h.usuario_id = u.id
            WHERE h.practicante_id = ?
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
     * Check if practicante has related records
     * @param {number} id - Practicante ID
     * @returns {Promise<boolean>}
     */
    static async hasRelatedRecords(id) {
        const sql = `
      SELECT 
        (SELECT COUNT(*) FROM Abono WHERE practicante_id = ? AND deleted_at IS NULL) as abonos,
        (SELECT COUNT(*) FROM Pago WHERE practicante_id = ? AND deleted_at IS NULL) as pagos,
        (SELECT COUNT(*) FROM Asistencia WHERE practicante_id = ? AND deleted_at IS NULL) as asistencias
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
            user_id: this.user_id,
            es_profesor: this.es_profesor,
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
            updated_at: this.updated_at,
            deleted_at: this.deleted_at
        };
    }
}

export default Practicante;
