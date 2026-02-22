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
    }

    /**
     * Create a new user
     * @param {Object} data - User data
     * @returns {Promise<User>}
     */
    static async create(data) {
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
        return await this.findById(result.insertId);
    }

    /**
     * Find user by ID
     * @param {number} id - User ID
     * @returns {Promise<User|null>}
     */
    static async findById(id) {
        const sql = 'SELECT * FROM User WHERE id = ?';
        const [rows] = await pool.execute(sql, [id]);

        if (rows.length === 0) {
            return null;
        }

        return new User(rows[0]);
    }

    /**
     * Find user by email
     * @param {string} email - User email
     * @returns {Promise<User|null>}
     */
    static async findByEmail(email) {
        const sql = 'SELECT * FROM User WHERE email = ?';
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
     * Convert to plain object
     * @returns {Object}
     */
    toJSON() {
        // Exclude password from JSON output for security reasons
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

export default User;