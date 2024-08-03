const { validationResult } = require('express-validator');

exports.badRequestErrorResponse = (res, msg) => {
  logger.log(`Bad Request Error: ${msg}`);

  return res.status(400).json({
    success: false,
    msg,
  });
};

exports.unauthorizedErrorResponse = (res, msg, statusCode = 401) => {
  logger.log(`Unauthorized Request Error: ${msg}`);

  return res.status(statusCode).json({
    success: false,
    msg,
  });
};

exports.internalServerErrorResponse = (res, error) => {
  logger.log(`Internal Server Error: ${error}`, 'error');

  return res.status(500).json({ success: false, msg: error.message });
};

exports.successResponse = (res, msg, data) => {
  logger.log(`Api Success: ${msg}`);

  return res.json({ success: true, msg, data });
};

exports.validationErrorHandler = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return this.badRequestErrorResponse(res, errors.array());
  }

  next();
};
