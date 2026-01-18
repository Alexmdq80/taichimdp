import Practicante from '../models/Practicante.js';
import HistorialSalud from '../models/HistorialSalud.js';
import { validatePracticante } from '../utils/validators.js';
import { ValidationError, NotFoundError, ConflictError } from '../utils/errors.js';

/**
 * Practicante Service
 */
export class PracticanteService {
  /**
   * Create a new practicante
   * @param {Object} data - Practicante data
   * @returns {Promise<Object>}
   */
  static async create(data) {
    // Validate input
    validatePracticante(data);

    // Create practicante
    const practicante = await Practicante.create(data);
    return practicante.toJSON();
  }

  /**
   * Find practicante by ID
   * @param {number} id - Practicante ID
   * @returns {Promise<Object>}
   * @throws {NotFoundError}
   */
  static async findById(id) {
    const practicante = await Practicante.findById(id);
    
    if (!practicante) {
      throw new NotFoundError('Practicante', id);
    }

    return practicante.toJSON();
  }

  /**
   * Find all practicantes with search and pagination
   * @param {Object} options - Search options
   * @returns {Promise<Object>}
   */
  static async findAll(options = {}) {
    const result = await Practicante.findAll(options);
    
    return {
      data: result.data.map(p => p.toJSON()),
      pagination: result.pagination
    };
  }

  /**
   * Update practicante
   * @param {number} id - Practicante ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>}
   * @throws {NotFoundError|ValidationError}
   */
  static async update(id, data) {
    // Check if practicante exists
    const existing = await Practicante.findById(id);
    if (!existing) {
      throw new NotFoundError('Practicante', id);
    }

    // Track health field changes (FR-006)
    const healthFields = ['condiciones_medicas', 'medicamentos', 'limitaciones_fisicas', 'alergias'];
    const changes = [];

    for (const field of healthFields) {
      if (data.hasOwnProperty(field) && data[field] !== existing[field]) {
        changes.push({
          practicante_id: id,
          campo_modificado: field,
          valor_anterior: existing[field] || null,
          valor_nuevo: data[field] || null
        });
      }
    }

    // Validate if updating required fields
    if (data.nombre_completo !== undefined || data.telefono !== undefined || data.email !== undefined) {
      const updateData = { ...existing.toJSON(), ...data };
      validatePracticante(updateData);
    }

    // Update practicante
    const updated = await Practicante.update(id, data);
    
    // Create health history records for changes
    for (const change of changes) {
      await HistorialSalud.create(change);
    }

    return updated.toJSON();
  }

  /**
   * Delete practicante
   * @param {number} id - Practicante ID
   * @returns {Promise<Object>}
   * @throws {NotFoundError|ConflictError}
   */
  static async delete(id) {
    // Check if practicante exists
    const practicante = await Practicante.findById(id);
    if (!practicante) {
      throw new NotFoundError('Practicante', id);
    }

    // Check for related records
    const hasRelated = await Practicante.hasRelatedRecords(id);
    if (hasRelated) {
      throw new ConflictError(
        'Cannot delete practicante',
        'Practicante has active abonos or payments. Please handle them first.'
      );
    }

    // Delete practicante
    const deleted = await Practicante.delete(id);
    if (!deleted) {
      throw new NotFoundError('Practicante', id);
    }

    return { id };
  }
}

export default PracticanteService;
