const { validationResult } = require('express-validator');
const { sendError } = require('./response');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formatted = errors.array().map((e) => ({
      field: e.path || e.param,
      message: e.msg,
      value: e.value,
    }));
    return sendError(res, { message: 'Validation failed', statusCode: 422, errors: formatted });
  }
  next();
};

module.exports = { handleValidationErrors };
