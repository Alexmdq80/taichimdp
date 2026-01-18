/**
 * Custom application error classes
 */

export class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id = null) {
    const message = id 
      ? `${resource} not found with id ${id}`
      : `${resource} not found`;
    super(message, 404);
    this.resource = resource;
    this.id = id;
  }
}

export class ConflictError extends AppError {
  constructor(message, details = null) {
    super(message, 409, details);
  }
}

/**
 * Error handler middleware for Express
 * @param {Error} err - Error object
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next function
 */
export function errorHandler(err, req, res, next) {
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode || 500,
    details: err.details,
    url: req.url,
    method: req.method
  });

  // Determine status code
  const statusCode = err.statusCode || 500;
  
  // Determine error message
  const message = statusCode === 500 
    ? 'Internal server error'
    : err.message;

  // Build error response
  const errorResponse = {
    error: message,
    ...(err.details && { details: err.details })
  };

  res.status(statusCode).json(errorResponse);
}

/**
 * Async error wrapper for route handlers
 * @param {Function} fn - Async route handler function
 * @returns {Function} - Wrapped route handler
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
