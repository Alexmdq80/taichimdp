import { TipoAbono } from '../models/TipoAbono.js';
import { AppError } from '../utils/errors.js';
import { validateTipoAbono } from '../utils/validators.js'; // Will create this validator

export class TipoAbonoService {
    static async create(data, userId) {
        validateTipoAbono(data); // Validate input data
        return await TipoAbono.create(data, userId);
    }

    static async findAll() {
        return await TipoAbono.findAll();
    }

    static async findById(id) {
        const tipoAbono = await TipoAbono.findById(id);
        if (!tipoAbono) {
            throw new AppError('TipoAbono not found', 404);
        }
        return tipoAbono;
    }

    static async update(id, data, userId) {
        validateTipoAbono(data); // Validate input data
        const tipoAbono = await TipoAbono.findById(id);
        if (!tipoAbono) {
            throw new AppError('TipoAbono not found', 404);
        }
        return await TipoAbono.update(id, data, userId);
    }

    static async delete(id, userId) {
        const tipoAbono = await TipoAbono.findById(id);
        if (!tipoAbono) {
            throw new AppError('TipoAbono not found', 404);
        }
        // TODO: Add logic to check for related records before deleting
        return await TipoAbono.delete(id, userId);
    }

    static async getHistory(id) {
        return await TipoAbono.getHistory(id);
    }
}

export default TipoAbonoService;
