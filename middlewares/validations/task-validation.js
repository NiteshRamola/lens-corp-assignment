const { body, param, query } = require('express-validator');
const { TASK_PRIORITY, TASK_STATUS } = require('../../constants/task-constant');
const moment = require('moment');

exports.validateCreateTask = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('dueDate')
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (moment(value).isBefore(moment())) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),
  body('priority')
    .isIn(Object.values(TASK_PRIORITY))
    .withMessage(
      `Please select one of these ${TASK_PRIORITY.LOW}, ${TASK_PRIORITY.MEDIUM} or ${TASK_PRIORITY.HIGH}`,
    ),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Valid user id is required'),
];

exports.validateUpdateTask = [
  param('id').isMongoId().withMessage('Valid task id is required'),
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title is required if provided'),
  body('description')
    .optional()
    .notEmpty()
    .withMessage('Description is required if provided'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date')
    .custom((value) => {
      if (moment(value).isBefore(moment())) {
        throw new Error('Due date cannot be in the past');
      }
      return true;
    }),
  body('priority')
    .optional()
    .isIn(Object.values(TASK_PRIORITY))
    .withMessage(
      `Priority must be one of these ${TASK_PRIORITY.LOW}, ${TASK_PRIORITY.MEDIUM} or ${TASK_PRIORITY.HIGH}`,
    ),
  body('status')
    .optional()
    .isIn(Object.values(TASK_STATUS))
    .withMessage(
      `Status must be one of these ${TASK_STATUS.PENDING}, ${TASK_STATUS.IN_PROGRESS} or ${TASK_STATUS.COMPLETED}`,
    ),
  body('userId')
    .optional()
    .isMongoId()
    .withMessage('Valid user id is required'),
];

exports.validateGetTaskById = [
  param('id').isMongoId().withMessage('Valid task id is required'),
];

exports.validateGetTaskList = [
  query('search')
    .optional()
    .isString()
    .withMessage('Search query must be a string'),
  query('limit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Limit must be an integer greater than 0'),
  query('sort').optional().isString().withMessage('Sort must be a string'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be an integer greater than 0'),
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Valid user id is required'),
  query('managerId')
    .optional()
    .isMongoId()
    .withMessage('Valid manager id is required'),
  query('status')
    .optional()
    .isIn(Object.values(TASK_STATUS))
    .withMessage(
      `Status must be one of these ${TASK_STATUS.PENDING}, ${TASK_STATUS.IN_PROGRESS} or ${TASK_STATUS.COMPLETED}`,
    ),
  query('priority')
    .optional()
    .isIn(Object.values(TASK_PRIORITY))
    .withMessage(
      `Please select one of these ${TASK_PRIORITY.LOW}, ${TASK_PRIORITY.MEDIUM} or ${TASK_PRIORITY.HIGH}`,
    ),
  query('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
];

exports.validateAssignUserToTask = [
  body('userId').isMongoId().withMessage('Valid user id is required'),
  body('taskId').isMongoId().withMessage('Valid task id is required'),
];

exports.validateUnassignUserFromTask = [
  body('taskId').isMongoId().withMessage('Valid task id is required'),
];

exports.validateGetTaskAnalytics = [
  query('userId')
    .optional()
    .isMongoId()
    .withMessage('Valid user id is required'),
  query('managerId')
    .optional()
    .isMongoId()
    .withMessage('Valid manager id is required'),
];
