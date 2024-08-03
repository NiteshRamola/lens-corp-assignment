const express = require('express');
const TaskController = require('../controllers/task-controller');
const {
  validateCreateTask,
  validateUpdateTask,
  validateGetTaskById,
  validateGetTaskList,
  validateAssignUserToTask,
  validateUnassignUserFromTask,
} = require('../middlewares/validations/task-validation');
const tokenVerify = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role-middleware');
const { USER_ROLES } = require('../constants/user-constant');
const { validationErrorHandler } = require('../utils/response');

const router = express.Router();

router.post(
  '/create',
  tokenVerify,
  roleMiddleware([USER_ROLES.MANAGER]),
  validateCreateTask,
  validationErrorHandler,
  TaskController.createTask,
);

router.put(
  '/updateTask/:id',
  tokenVerify,
  roleMiddleware([USER_ROLES.MANAGER, USER_ROLES.USER]),
  validateUpdateTask,
  validationErrorHandler,
  TaskController.updateTask,
);

router.get(
  '/getTaskById/:id',
  tokenVerify,
  validateGetTaskById,
  validationErrorHandler,
  TaskController.getTaskById,
);

router.get(
  '/getTaskList',
  tokenVerify,
  validateGetTaskList,
  validationErrorHandler,
  TaskController.getTaskList,
);

router.post(
  '/assignUserToTask',
  tokenVerify,
  roleMiddleware([USER_ROLES.MANAGER]),
  validateAssignUserToTask,
  validationErrorHandler,
  TaskController.assignUserToTask,
);

router.post(
  '/unassignUserFromTask',
  tokenVerify,
  roleMiddleware([USER_ROLES.MANAGER]),
  validateUnassignUserFromTask,
  validationErrorHandler,
  TaskController.unassignUserFromTask,
);

module.exports = router;
