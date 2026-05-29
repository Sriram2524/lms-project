const { sendError } = require('./utils/response');

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const globalErrorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';

  // Sequelize unique constraint violation
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors?.[0]?.path || 'field';
    const value = err.errors?.[0]?.value || '';
    return sendError(res, {
      message: `${field} '${value}' already exists`,
      statusCode: 409,
    });
  }

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }));
    return sendError(res, { message: 'Validation failed', statusCode: 422, errors });
  }

  // Sequelize foreign key constraint
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return sendError(res, { message: 'Referenced resource not found', statusCode: 400 });
  }

  // Sequelize database error (e.g. invalid enum value)
  if (err.name === 'SequelizeDatabaseError') {
    return sendError(res, {
      message: isDev ? err.message : 'Database error',
      statusCode: 400,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, { message: 'Invalid token. Please log in again.', statusCode: 401 });
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, { message: 'Token has expired. Please log in again.', statusCode: 401 });
  }

  // Operational (known) errors
  if (err.isOperational) {
    return sendError(res, { message: err.message, statusCode: err.statusCode });
  }

  // Unknown errors
  console.error('💥 UNEXPECTED ERROR:', err);
  if (isDev) {
    return sendError(res, { message: err.message, statusCode: 500, errors: { stack: err.stack } });
  }
  return sendError(res, { message: 'Something went wrong. Please try again.', statusCode: 500 });
};

module.exports = { AppError, globalErrorHandler };
