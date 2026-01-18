import { ValidationError } from './errors.js';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param {string} date - Date string to validate
 * @returns {boolean}
 */
export function isValidDate(date) {
  if (!date) return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate);
}

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  // Basic validation: allows numbers, spaces, +, -, ()
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

/**
 * Validate positive number
 * @param {number} value - Number to validate
 * @returns {boolean}
 */
export function isPositiveNumber(value) {
  return typeof value === 'number' && value > 0;
}

/**
 * Validate required field
 * @param {any} value - Value to check
 * @param {string} fieldName - Name of the field
 * @throws {ValidationError}
 */
export function validateRequired(value, fieldName) {
  if (value === null || value === undefined || value === '') {
    throw new ValidationError(`${fieldName} is required`);
  }
}

/**
 * Validate practicante data
 * @param {Object} data - Practicante data
 * @throws {ValidationError}
 */
export function validatePracticante(data) {
  const errors = [];

  // Validate nombre_completo
  if (!data.nombre_completo || typeof data.nombre_completo !== 'string' || data.nombre_completo.trim() === '') {
    errors.push({
      field: 'nombre_completo',
      message: 'nombre_completo is required'
    });
  }

  // Validate at least one of telefono or email
  if (!data.telefono && !data.email) {
    errors.push({
      field: 'telefono',
      message: 'At least one of telefono or email must be provided'
    });
  }

  // Validate email format if provided
  if (data.email && !isValidEmail(data.email)) {
    errors.push({
      field: 'email',
      message: 'email must be a valid email address'
    });
  }

  // Validate phone format if provided
  if (data.telefono && !isValidPhone(data.telefono)) {
    errors.push({
      field: 'telefono',
      message: 'telefono must be a valid phone number'
    });
  }

  // Validate fecha_nacimiento if provided
  if (data.fecha_nacimiento && !isValidDate(data.fecha_nacimiento)) {
    errors.push({
      field: 'fecha_nacimiento',
      message: 'fecha_nacimiento must be a valid date in YYYY-MM-DD format'
    });
  }

  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Sanitize string input to prevent XSS
 * @param {string} input - Input string
 * @returns {string} - Sanitized string
 */
export function sanitizeString(input) {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize object values (recursive)
 * @param {Object} obj - Object to sanitize
 * @returns {Object} - Sanitized object
 */
export function sanitizeObject(obj) {
  if (typeof obj !== 'object' || obj === null) {
    return typeof obj === 'string' ? sanitizeString(obj) : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = sanitizeObject(value);
  }
  return sanitized;
}
