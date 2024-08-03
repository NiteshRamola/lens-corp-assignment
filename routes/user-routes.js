const express = require('express');
const tokenVerify = require('../middlewares/auth.middleware');
const userController = require('../controllers/user-controller');
const roleMiddleware = require('../middlewares/role-middleware');
const { USER_ROLES } = require('../constants/user-constant');
const {
  validateUserList,
  validateUserId,
  validateAssignManager,
  validateUnassignManager,
} = require('../middlewares/validations/user-validation');
const { validationErrorHandler } = require('../utils/response');

const router = express.Router();

router.get('/profile', tokenVerify, userController.getProfile);

router.get(
  '/getUserList',
  tokenVerify,
  roleMiddleware([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  validateUserList,
  validationErrorHandler,
  userController.getUserList,
);

router.get(
  '/getUserById/:id',
  tokenVerify,
  roleMiddleware([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  validateUserId,
  validationErrorHandler,
  userController.getUserById,
);

router.post(
  '/assignManager',
  tokenVerify,
  roleMiddleware([USER_ROLES.ADMIN]),
  validateAssignManager,
  validationErrorHandler,
  userController.assignManager,
);

router.post(
  '/unassignManager',
  tokenVerify,
  roleMiddleware([USER_ROLES.ADMIN]),
  validateUnassignManager,
  validationErrorHandler,
  userController.unassignManager,
);

module.exports = router;
