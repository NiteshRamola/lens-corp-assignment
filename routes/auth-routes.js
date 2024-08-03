const express = require('express');
const authController = require('../controllers/auth-controller');
const tokenVerify = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role-middleware');
const { USER_ROLES } = require('../constants/user-constant');
const {
  validateRegister,
  validateLogin,
  validateCreateManager,
} = require('../middlewares/validations/auth-validation');
const { validationErrorHandler } = require('../utils/response');

const router = express.Router();

router.post(
  '/register',
  validateRegister,
  validationErrorHandler,
  authController.register,
);

router.post(
  '/login',
  validateLogin,
  validationErrorHandler,
  authController.login,
);

router.post(
  '/logout',
  tokenVerify,
  validationErrorHandler,
  authController.logout,
);

router.post(
  '/createManager',
  tokenVerify,
  roleMiddleware([USER_ROLES.ADMIN]),
  validateCreateManager,
  validationErrorHandler,
  authController.createManager,
);

module.exports = router;
