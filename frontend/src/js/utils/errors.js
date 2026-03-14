/**
 * Frontend error handling utilities
 */

/**
 * Display error message to user as a floating toast
 * @param {string} message - Error message
 */
export function showError(message) {
    // Remove existing error messages to avoid stacking too many
    const existingErrors = document.querySelectorAll('.error-message');
    existingErrors.forEach(el => el.remove());

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i> <span>${message}</span>`;
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'assertive');

    // Always append to body for fixed positioning
    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.classList.add('fade-out'); // Optional: could add fade-out animation
            setTimeout(() => errorDiv.remove(), 300);
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
        message: errorData.error || errorData.message || 'An error occurred',
        details: errorData.details,
        status: response.status
    };
}

/**
 * Display API error to user
 * @param {Object} error - Error object
 */
export function displayApiError(error) {
    let message = error.message;
    if (error.details) {
        if (Array.isArray(error.details)) {
            message += ': ' + error.details.map(d => d.message || d).join(', ');
        } else if (typeof error.details === 'string') {
            message += ': ' + error.details;
        }
    }
    showError(message);
}

/**
 * Display success message to user as a floating toast
 * @param {string} message - Success message
 */
export function showSuccess(message) {
    // Remove existing success messages
    const existingSuccesses = document.querySelectorAll('.success-message');
    existingSuccesses.forEach(el => el.remove());

    // Create success element
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `<i class="fas fa-check-circle mr-2"></i> <span>${message}</span>`;
    successDiv.setAttribute('role', 'alert');
    successDiv.setAttribute('aria-live', 'polite');

    // Always append to body
    document.body.appendChild(successDiv);

    // Auto-remove after 4 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 4000);
}
