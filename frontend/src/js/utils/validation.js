/**
 * Frontend validation utilities
 */

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
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  if (!phone) return false;
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 8;
}

/**
 * Validate required field
 * @param {any} value - Value to check
 * @returns {boolean}
 */
export function isRequired(value) {
  return value !== null && value !== undefined && value !== '';
}

/**
 * Get validation error message
 * @param {string} field - Field name
 * @param {string} rule - Validation rule
 * @returns {string} - Error message
 */
export function getValidationMessage(field, rule) {
  const messages = {
    required: `${field} is required`,
    email: `${field} must be a valid email address`,
    phone: `${field} must be a valid phone number`,
    date: `${field} must be a valid date`,
    positive: `${field} must be a positive number`
  };
  return messages[rule] || `${field} is invalid`;
}

/**
 * Validate form field
 * @param {HTMLInputElement} input - Input element
 * @param {Array<string>} rules - Validation rules
 * @returns {string|null} - Error message or null if valid
 */
export function validateField(input, rules) {
  const value = input.value.trim();
  const fieldName = input.getAttribute('name') || input.id || 'Field';

  for (const rule of rules) {
    if (rule === 'required' && !isRequired(value)) {
      return getValidationMessage(fieldName, 'required');
    }
    if (rule === 'email' && value && !isValidEmail(value)) {
      return getValidationMessage(fieldName, 'email');
    }
    if (rule === 'phone' && value && !isValidPhone(value)) {
      return getValidationMessage(fieldName, 'phone');
    }
    if (rule === 'date' && value && !isValidDate(value)) {
      return getValidationMessage(fieldName, 'date');
    }
    if (rule === 'positive' && value) {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return getValidationMessage(fieldName, 'positive');
      }
    }
  }

  return null;
}

/**
 * Show field validation error
 * @param {HTMLInputElement} input - Input element
 * @param {string} message - Error message
 */
export function showFieldError(input, message) {
  // Remove existing error
  const existingError = input.parentElement?.querySelector('.field-error');
  if (existingError) {
    existingError.remove();
  }

  // Add error class
  input.classList.add('error');

  // Create error message element
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  errorDiv.setAttribute('role', 'alert');
  errorDiv.id = `${input.id || input.name}-error`;

  // Insert after input
  input.setAttribute('aria-describedby', errorDiv.id);
  input.parentElement?.insertBefore(errorDiv, input.nextSibling);
}

/**
 * Clear field validation error
 * @param {HTMLInputElement} input - Input element
 */
export function clearFieldError(input) {
  input.classList.remove('error');
  const errorDiv = input.parentElement?.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
  input.removeAttribute('aria-describedby');
}
