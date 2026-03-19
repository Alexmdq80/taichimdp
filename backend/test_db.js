
import pool from './src/config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
    try {
        const [rows] = await pool.execute('SELECT * FROM Pago WHERE deuda_id IS NULL LIMIT 1');
        console.log('Query successful, found:', rows.length);
        const [rows2] = await pool.execute(`
            SELECT 
                d.id, d.practicante_id, 
                (d.monto - IFNULL((SELECT SUM(monto) FROM Pago WHERE deuda_id = d.id AND deleted_at IS NULL), 0)) as monto
            FROM Deuda d
            LIMIT 1
        `);
        console.log('Complex query successful, found:', rows2.length);
    } catch (error) {
        console.error('Error executing query:', error.message);
    } finally {
        await pool.end();
    }
}

test();
