const express = require('express');
const tokenVerify = require('../middlewares/auth.middleware');
const userController = require('../controllers/user-controller');
const roleMiddleware = require('../middlewares/role-middleware');
const { USER_ROLES } = require('../constants/user-constant');

const router = express.Router();

router.get('/profile', tokenVerify, userController.getProfile);

router.get(
  '/getUserList',
  tokenVerify,
  roleMiddleware([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  userController.getUserList,
);

router.get(
  '/getUserById/:id',
  tokenVerify,
  roleMiddleware([USER_ROLES.ADMIN, USER_ROLES.MANAGER]),
  userController.getUserById,
);

module.exports = router;
