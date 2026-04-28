const logger = require('../utils/logger');
const ResponseFormatter = require('../utils/response');
const {
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
} = require('../utils/errors');

/**
 * 404 Not Found Middleware
 * Catches requests to non-existent routes
 */
const notFound = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl}`);
  next(error);
};

/**
 * Global Error Handler
 * Handles all errors and sends consistent responses
 */
const errorHandler = (err, req, res, next) => {
  // Log the error
  const logLevel = err.statusCode >= 500 ? 'error' : 'warn';
  logger[logLevel](`${err.name || 'Error'}: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode: err.statusCode,
  });

  // Default to 500 if status code not set
  const statusCode = err.statusCode || res.statusCode === 200 ? 500 : res.statusCode;

  // Operational errors (expected)
  if (err.isOperational) {
    return ResponseFormatter.error(res, err.message, statusCode, err.details || null);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => e.message);
    return ResponseFormatter.validationError(res, details);
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    return ResponseFormatter.error(res, 'Invalid ID format', 400);
  }

  // Duplicate key error (MongoDB)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return ResponseFormatter.error(res, `${field} already exists`, 409);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ResponseFormatter.error(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ResponseFormatter.error(res, 'Token expired', 401);
  }

  // Development vs Production error details
  const message = process.env.NODE_ENV === 'production' && !err.isOperational
    ? 'Something went wrong'
    : err.message;

  const details = process.env.NODE_ENV === 'production'
    ? null
    : { stack: err.stack };

  ResponseFormatter.error(res, message, statusCode, details);
};

module.exports = { notFound, errorHandler };
