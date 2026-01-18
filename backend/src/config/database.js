import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tai_chi_management',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Test database connection
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

/**
 * Get a connection from the pool
 * @returns {Promise<mysql.PoolConnection>}
 */
export async function getConnection() {
  return await pool.getConnection();
}

/**
 * Execute a query
 * @param {string} sql - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<any>}
 */
export async function query(sql, params) {
  const [results] = await pool.execute(sql, params);
  return results;
}

/**
 * Begin a transaction
 * @returns {Promise<mysql.PoolConnection>}
 */
export async function beginTransaction() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
}

/**
 * Commit a transaction
 * @param {mysql.PoolConnection} connection
 */
export async function commitTransaction(connection) {
  await connection.commit();
  connection.release();
}

/**
 * Rollback a transaction
 * @param {mysql.PoolConnection} connection
 */
export async function rollbackTransaction(connection) {
  await connection.rollback();
  connection.release();
}

export default pool;
