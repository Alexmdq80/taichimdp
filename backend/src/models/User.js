import pool from '../config/database.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/**
 * User Model
 */
export class User {
    constructor(data) {
        this.id = data.id || null;
        this.email = data.email;
        this.password = data.password;
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.deleted_at = data.deleted_at || null;
    }

    /**
     * Create a new user
     * @param {Object} data - User data
     * @param {number} [creatorId] - ID of the user creating this user
     * @returns {Promise<User>}
     */
    static async create(data, creatorId = null) {
        const hashedPassword = await bcrypt.hash(data.password, SALT_ROUNDS);
        const sql = `
            INSERT INTO User (
                email, password
            ) VALUES (?, ?)
        `;

        const values = [
            data.email,
            hashedPassword
        ];

        const [result] = await pool.execute(sql, values);
        const newUser = await this.findById(result.insertId);

        if (newUser) {
            await this.recordHistory(newUser.id, 'CREATE', null, newUser.toJSON(), creatorId);
        }

        return newUser;
    }
/**
 * Find all users
 * @returns {Promise<User[]>}
 */
static async findAll() {
    const sql = 'SELECT * FROM User WHERE deleted_at IS NULL ORDER BY email ASC';
    const [rows] = await pool.execute(sql);
    return rows.map(row => new User(row));
}

/**
 * Find user by ID (only non-deleted)
...
     * @param {number} id - User ID
     * @returns {Promise<User|null>}
     */
    static async findById(id) {
        const sql = 'SELECT * FROM User WHERE id = ? AND deleted_at IS NULL';
        const [rows] = await pool.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        return new User(rows[0]);
    }

    /**
     * Find user by email (only non-deleted)
     * @param {string} email - User email
     * @returns {Promise<User|null>}
     */
    static async findByEmail(email) {
        const sql = 'SELECT * FROM User WHERE email = ? AND deleted_at IS NULL';
        const [rows] = await pool.execute(sql, [email]);

        if (rows.length === 0) {
            return null;
        }

        return new User(rows[0]);
    }

    /**
     * Compare provided password with stored hashed password
     * @param {string} candidatePassword - Password to compare
     * @returns {Promise<boolean>}
     */
    async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    }

    /**
     * Delete (Soft Delete) user and record history
     * @param {number} id - User ID
     * @param {number} [deleterId] - ID of the user performing the deletion
     * @returns {Promise<boolean>}
     */
    static async delete(id, deleterId = null) {
        const currentUser = await this.findById(id);
        if (!currentUser) return false;

        const sql = 'UPDATE User SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND deleted_at IS NULL';
        const [result] = await pool.execute(sql, [id]);

        if (result.affectedRows > 0) {
            await this.recordHistory(id, 'DELETE', currentUser.toJSON(), null, deleterId);
            return true;
        }
        return false;
    }

    /**
     * Record modification history
     * @param {number} userId - User ID affected
     * @param {string} action - Action performed (CREATE, UPDATE, DELETE)
     * @param {Object|null} oldData - Data before change
     * @param {Object|null} newData - Data after change
     * @param {number|null} actorId - ID of the user who performed the action
     * @returns {Promise<void>}
     */
    static async recordHistory(userId, action, oldData, newData, actorId) {
        const sql = `
            INSERT INTO HistorialUser (
                user_id, accion, datos_anteriores, datos_nuevos, usuario_id
            ) VALUES (?, ?, ?, ?, ?)
        `;

        // Ensure we don't log passwords if for some reason they are in the JSON
        const safeOld = oldData ? { ...oldData } : null;
        if (safeOld && safeOld.password) delete safeOld.password;

        const safeNew = newData ? { ...newData } : null;
        if (safeNew && safeNew.password) delete safeNew.password;

        const values = [
            userId,
            action,
            safeOld ? JSON.stringify(safeOld) : null,
            safeNew ? JSON.stringify(safeNew) : null,
            actorId
        ];

        await pool.execute(sql, values);
    }

    /**
     * Get history of a user
     * @param {number} id - User ID
     * @returns {Promise<Array>}
     */
    static async getHistory(id) {
        const sql = `
            SELECT h.*, u.email as usuario_email
            FROM HistorialUser h
            LEFT JOIN User u ON h.usuario_id = u.id
            WHERE h.user_id = ?
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
        // Exclude password from JSON output for security reasons
        const { password, ...userWithoutPassword } = this;
        return {
            ...userWithoutPassword,
            deleted_at: this.deleted_at // Ensure this is included
        };
    }
}

export default User;
