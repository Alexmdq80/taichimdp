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
     * @returns {Promise<Pago>}
     */
    static async createPayment(practicanteId, tipoAbonoId, metodoPago = 'efectivo', notas = null) {
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
            const fechaPagoStr = today.toISOString().split('T')[0];

            // 1. Determine start date (today or day after existing active abono ends)
            const activeAbono = await Abono.findActiveByPracticanteId(practicanteId, connection);
            let fechaInicio = new Date(today);

            if (activeAbono && new Date(activeAbono.fecha_vencimiento) >= today) {
                fechaInicio = new Date(activeAbono.fecha_vencimiento);
                fechaInicio.setDate(fechaInicio.getDate() + 1);
            }

            // 2. Calculate expiration date
            const fechaVencimiento = new Date(fechaInicio);
            fechaVencimiento.setDate(fechaVencimiento.getDate() + tipoAbono.duracion_dias);

            const fechaInicioStr = fechaInicio.toISOString().split('T')[0];
            const fechaVencimientoStr = fechaVencimiento.toISOString().split('T')[0];

            // 3. Create Abono record
            const newAbono = await Abono.create({
                practicante_id: practicanteId,
                tipo_abono_id: tipoAbonoId,
                fecha_inicio: fechaInicioStr,
                fecha_vencimiento: fechaVencimientoStr,
                estado: 'activo'
            }, connection);

            // 4. Create Pago record linked to the new Abono
            const pagoData = {
                practicante_id: practicanteId,
                abono_id: newAbono.id, // Linked to the newly created Abono
                fecha: fechaPagoStr,
                monto: tipoAbono.precio,
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
     * Get all payments for a specific practicante
     * @param {number} practicanteId - ID of the practicante
     * @returns {Promise<Pago[]>}
     */
    static async getPaymentsByPracticanteId(practicanteId) {
        return await Pago.findByPracticanteId(practicanteId);
    }
}

export default PagoService;
