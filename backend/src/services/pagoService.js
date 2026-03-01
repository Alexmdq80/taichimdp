import Pago from '../models/Pago.js';
import Practicante from '../models/Practicante.js';
import TipoAbono from '../models/TipoAbono.js';
import Abono from '../models/Abono.js';
import { AppError } from '../utils/errors.js';
import pool from '../config/database.js'; // Import pool to get connection

export class PagoService {
    /**
     * Create a new payment for a practicante
     * @param {number} practicanteId - ID of the practicante
     * @param {number} tipoAbonoId - ID of the TipoAbono
     * @param {string} [metodoPago='efectivo'] - Payment method
     * @param {string} [notas=null] - Optional notes for the payment
     * @param {number} [cantidad=1] - Number of units or multipliers
     * @param {Object} [extraData={}] - Extra data (mes_abono, fecha_vencimiento)
     * @param {number} [userId=null] - ID of the user creating the payment
     * @returns {Promise<Pago>}
     */
    static async createPayment(practicanteId, tipoAbonoId, metodoPago = 'efectivo', notas = null, cantidad = 1, extraData = {}, userId = null) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            // Use models with the transaction connection
            const practicante = await Practicante.findById(practicanteId, connection);
            if (!practicante) {
                throw new AppError('Practicante not found', 404);
            }

            const tipoAbono = await TipoAbono.findById(tipoAbonoId, connection);
            if (!tipoAbono) {
                throw new AppError('Tipo de Abono not found', 404);
            }

            const today = new Date();
            // Use local date for YYYY-MM-DD to avoid UTC shifts
            const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            const fechaPagoStr = extraData.fecha_pago || todayStr;

            // 1. Determine start date
            const activeAbono = await Abono.findActiveByPracticanteId(practicanteId, connection);
            let fechaInicio = new Date(today);
            
            // For flexible classes (particular/compartida), we don't usually stack by date
            const isFlexible = (tipoAbono.categoria === 'particular' || tipoAbono.categoria === 'compartida');

            if (!isFlexible && activeAbono && new Date(activeAbono.fecha_vencimiento) >= today) {
                const existingVencimiento = new Date(activeAbono.fecha_vencimiento);
                fechaInicio = new Date(existingVencimiento);
                fechaInicio.setDate(fechaInicio.getDate() + 1);
            }

            // 2. Calculate expiration date
            let fechaVencimiento;
            
            if (extraData.fecha_vencimiento) {
                fechaVencimiento = new Date(extraData.fecha_vencimiento);
            } else {
                // If it's a "unit-based" class (duration 0), expiration is the same day as start.
                const duracion = tipoAbono.duracion_dias !== null ? tipoAbono.duracion_dias : 0;
                const totalDuracion = duracion * cantidad;
                
                const baseDate = new Date(fechaInicio);
                baseDate.setDate(baseDate.getDate() + totalDuracion);
                fechaVencimiento = baseDate;
            }

            // Safety check: ensure fechaVencimiento >= fechaInicio to satisfy DB constraint
            if (fechaVencimiento < fechaInicio) {
                fechaInicio = new Date(fechaVencimiento);
            }

            const fechaInicioStr = `${fechaInicio.getFullYear()}-${String(fechaInicio.getMonth() + 1).padStart(2, '0')}-${String(fechaInicio.getDate()).padStart(2, '0')}`;
            const fechaVencimientoStr = `${fechaVencimiento.getFullYear()}-${String(fechaVencimiento.getMonth() + 1).padStart(2, '0')}-${String(fechaVencimiento.getDate()).padStart(2, '0')}`;

            // 3. Create Abono record
            const abonoData = {
                practicante_id: practicanteId,
                tipo_abono_id: tipoAbonoId,
                fecha_inicio: fechaInicioStr,
                fecha_vencimiento: fechaVencimientoStr,
                mes_abono: extraData.mes_abono || null,
                lugar_id: extraData.lugar_id || tipoAbono.lugar_id,
                estado: 'activo',
                cantidad: cantidad
            };
            
            // Pass userId to create method for history
            const newAbono = await Abono.create(abonoData, connection, userId);

            // 4. Create Pago record linked to the new Abono
            const pagoData = {
                practicante_id: practicanteId,
                abono_id: newAbono.id, // Linked to the newly created Abono
                mes_abono: abonoData.mes_abono,
                lugar_id: abonoData.lugar_id,
                fecha: fechaPagoStr,
                monto: (tipoAbono.precio || 0) * cantidad,
                metodo_pago: metodoPago,
                notas: notas
            };

            // Pass userId to create method for history
            const newPago = await Pago.create(pagoData, connection, userId);

            await connection.commit();
            return newPago;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    /**
     * Get all payments with optional filtering
     * @param {Object} [filters] - Search filters
     * @returns {Promise<Pago[]>}
     */
    static async getAllPayments(filters = {}) {
        return await Pago.findAll(filters);
    }

    /**
     * Get all payments for a specific practicante
     * @param {number} practicanteId - ID of the practicante
     * @returns {Promise<Pago[]>}
     */
    static async getPaymentsByPracticanteId(practicanteId) {
        return await Pago.findByPracticanteId(practicanteId);
    }

    /**
     * Delete (soft-delete) a payment and cancel its related abono
     * @param {number} pagoId - ID of the payment to delete
     * @param {number} [userId=null] - ID of the user deleting the payment
     * @returns {Promise<boolean>}
     */
    static async deletePayment(pagoId, userId = null) {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        try {
            const pago = await Pago.findById(pagoId, connection);
            if (!pago) {
                throw new AppError('Payment not found', 404);
            }

            // 1. Soft delete the payment
            const deleted = await Pago.delete(pagoId, connection, userId);

            // 2. Mark related abono as 'cancelado' if it exists
            if (pago.abono_id) {
                await Abono.updateStatus(pago.abono_id, 'cancelado', connection, userId);
            }

            await connection.commit();
            return deleted;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

export default PagoService;
