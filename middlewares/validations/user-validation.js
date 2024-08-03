const { body, param, query } = require('express-validator');
const { USER_ROLES } = require('../../constants/user-constant');

exports.validateUserId = [
  param('id').isMongoId().withMessage('Invalid user ID'),
];

exports.validateAssignManager = [
  body('userId').isMongoId().withMessage('Invalid user ID'),
  body('managerId').isMongoId().withMessage('Invalid manager ID'),
];

exports.validateUnassignManager = [
  body('userId').isMongoId().withMessage('Invalid user ID'),
];

exports.validateUserList = [
  query('search').optional().isString().withMessage('Search must be a string'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be a positive integer'),
  query('sort').optional().isString().withMessage('Sort must be a string'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('role')
    .optional()
    .isIn([USER_ROLES.USER, USER_ROLES.MANAGER])
    .withMessage(
      `Role must be one of ${USER_ROLES.USER} or ${USER_ROLES.MANAGER}`,
    ),
  query('managerId').optional().isMongoId().withMessage('Invalid manager ID'),
];
