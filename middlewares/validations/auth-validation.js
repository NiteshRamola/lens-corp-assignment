const { body, param, query } = require('express-validator');

exports.validateRegister = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be 10 digits long')
    .isNumeric()
    .withMessage('Phone number must be valid'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];

exports.validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.validateCreateManager = [
  body('username').notEmpty().withMessage('Username is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone')
    .isLength({ min: 10, max: 10 })
    .withMessage('Phone number must be 10 digits long')
    .isNumeric()
    .withMessage('Phone number must be valid'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
];
