import { Pago } from '../models/Pago.js';
import { Practicante } from '../models/Practicante.js';
import { TipoAbono } from '../models/TipoAbono.js';
import { Abono } from '../models/Abono.js';
import { AppError } from '../utils/errors.js';
import { beginTransaction, commitTransaction, rollbackTransaction } from '../config/database.js';

export class PagoService {
    /**
     * Create a new payment for a practicante
     * @param {number} practicanteId - ID of the practicante
     * @param {number} tipoAbonoId - ID of the TipoAbono
     * @param {string} [metodoPago='efectivo'] - Payment method
     * @param {string} [notas=null] - Optional notes for the payment
     * @param {number} [cantidad=1] - Number of units or multipliers
     * @param {Object} [extraData={}] - Extra data (mes_abono, fecha_vencimiento)
     * @returns {Promise<Pago>}
     */
    static async createPayment(practicanteId, tipoAbonoId, metodoPago = 'efectivo', notas = null, cantidad = 1, extraData = {}) {
        const connection = await beginTransaction();

        try {
            const practicante = await Practicante.findById(practicanteId, connection);
            if (!practicante) {
                throw new AppError('Practicante not found', 404);
            }

            const tipoAbono = await TipoAbono.findById(tipoAbonoId, connection);
            if (!tipoAbono) {
                throw new AppError('Tipo de Abono not found', 404);
            }

            const today = new Date();
            const fechaPagoStr = extraData.fecha_pago || today.toISOString().split('T')[0];

            // 1. Determine start date (today or day after existing active abono ends)
            const activeAbono = await Abono.findActiveByPracticanteId(practicanteId, connection);
            let fechaInicio = new Date(today);

            if (activeAbono && new Date(activeAbono.fecha_vencimiento) >= today) {
                fechaInicio = new Date(activeAbono.fecha_vencimiento);
                fechaInicio.setDate(fechaInicio.getDate() + 1);
            }

            // 2. Calculate expiration date
            let fechaVencimiento;
            
            if (extraData.fecha_vencimiento) {
                fechaVencimiento = new Date(extraData.fecha_vencimiento);
            } else {
                fechaVencimiento = new Date(fechaInicio);
                // If it's a "unit-based" class (duration 0), expiration is the same day.
                // If it's a subscription, multiply duration by quantity.
                const totalDuracion = tipoAbono.duracion_dias * cantidad;
                fechaVencimiento.setDate(fechaVencimiento.getDate() + totalDuracion);
            }

            const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
            const fechaVencimientoStr = fechaVencimiento.toISOString().split('T')[0];

            // 3. Create Abono record
            const newAbono = await Abono.create({
                practicante_id: practicanteId,
                tipo_abono_id: tipoAbonoId,
                fecha_inicio: fechaInicioStr,
                fecha_vencimiento: fechaVencimientoStr,
                mes_abono: extraData.mes_abono || null,
                lugar_id: extraData.lugar_id || tipoAbono.lugar_id,
                estado: 'activo',
                cantidad: cantidad
            }, connection);

            // 4. Create Pago record linked to the new Abono
            const pagoData = {
                practicante_id: practicanteId,
                abono_id: newAbono.id, // Linked to the newly created Abono
                fecha: fechaPagoStr,
                monto: tipoAbono.precio * cantidad,
                metodo_pago: metodoPago,
                notas: notas
            };

            const pago = await Pago.create(pagoData, connection);

            await commitTransaction(connection);
            return pago;
        } catch (error) {
            await rollbackTransaction(connection);
            throw error;
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
     * @returns {Promise<boolean>}
     */
    static async deletePayment(pagoId) {
        const connection = await beginTransaction();

        try {
            const pago = await Pago.findById(pagoId, connection);
            if (!pago) {
                throw new AppError('Payment not found', 404);
            }

            // 1. Soft delete the payment
            const deleted = await Pago.delete(pagoId, connection);

            // 2. Mark related abono as 'cancelado' if it exists
            if (pago.abono_id) {
                await Abono.updateStatus(pago.abono_id, 'cancelado', connection);
            }

            await commitTransaction(connection);
            return deleted;
        } catch (error) {
            await rollbackTransaction(connection);
            throw error;
        }
    }
}

export default PagoService;
