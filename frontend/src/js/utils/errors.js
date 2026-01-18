/**
 * Frontend error handling utilities
 */

/**
 * Display error message to user
 * @param {string} message - Error message
 * @param {HTMLElement} container - Container element to display error in
 */
export function showError(message, container = document.body) {
    // Remove existing error messages
    const existingError = container.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'assertive');

    // Insert at the beginning of container
    container.insertBefore(errorDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

/**
 * Handle API error response
 * @param {Response} response - Fetch API response
 * @returns {Promise<Object>} - Error object
 */
export async function handleApiError(response) {
    let errorData;
    try {
        errorData = await response.json();
    } catch (e) {
        errorData = { error: 'An error occurred', details: response.statusText };
    }

    return {
        message: errorData.error || 'An error occurred',
        details: errorData.details,
        status: response.status
    };
}

/**
 * Display API error to user
 * @param {Object} error - Error object from handleApiError
 * @param {HTMLElement} container - Container element
 */
export function displayApiError(error, container = document.body) {
    let message = error.message;
    if (error.details) {
        if (Array.isArray(error.details)) {
            message += ': ' + error.details.map(d => d.message || d).join(', ');
        } else if (typeof error.details === 'string') {
            message += ': ' + error.details;
        }
    }
    showError(message, container);
}

/**
 * Display success message to user
 * @param {string} message - Success message
 * @param {HTMLElement} container - Container element to display message in
 */
export function showSuccess(message, container = document.body) {
    // Remove existing success messages
    const existingSuccess = container.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }

    // Create success element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.setAttribute('role', 'alert');
    successDiv.setAttribute('aria-live', 'polite');

    // Insert at the beginning of container
    container.insertBefore(successDiv, container.firstChild);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}
