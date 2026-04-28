/**
 * Custom Error Classes
 * Provides consistent error handling across the application
 * All operational errors should use these classes
 */

/**
 * Base Application Error
 * All custom errors inherit from this
 */
class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 - Bad Request
 * Use when client sends invalid data
 */
class BadRequestError extends AppError {
  constructor(message = 'Bad Request') {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

/**
 * 401 - Unauthorized
 * Use when authentication fails
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 - Forbidden
 * Use when user lacks permissions
 */
class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 - Not Found
 * Use when resource doesn't exist
 */
class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 - Conflict
 * Use when resource already exists
 */
class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

/**
 * 422 - Unprocessable Entity
 * Use when validation fails
 */
class ValidationError extends AppError {
  constructor(details = []) {
    super('Validation failed', 422);
    this.name = 'ValidationError';
    this.details = details;
  }
}

/**
 * 429 - Too Many Requests
 * Use for rate limiting
 */
class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

/**
 * 500 - Internal Server Error
 * Use for unexpected errors
 */
class InternalServerError extends AppError {
  constructor(message = 'Internal Server Error') {
    super(message, 500, false); // Not operational
    this.name = 'InternalServerError';
  }
}

/**
 * 503 - Service Unavailable
 * Use when external service (DB, API) is down
 */
class ServiceUnavailableError extends AppError {
  constructor(service = 'Service') {
    super(`${service} is currently unavailable`, 503);
    this.name = 'ServiceUnavailableError';
  }
}

module.exports = {
  AppError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  RateLimitError,
  InternalServerError,
  ServiceUnavailableError,
};
