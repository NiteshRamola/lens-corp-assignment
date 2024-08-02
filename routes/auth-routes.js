const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth-controller');
const tokenVerify = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role-middleware');
const { USER_ROLES } = require('../constants/user-constant');

const router = express.Router();

router.post(
  '/register',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({
      min: 6,
    }),
  ],
  authController.register,
);

router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({
      min: 6,
    }),
  ],
  authController.login,
);

router.post('/logout', tokenVerify, authController.logout);

router.post(
  '/createManager',
  [
    check('username', 'Username is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({
      min: 6,
    }),
  ],
  tokenVerify,
  roleMiddleware([USER_ROLES.ADMIN]),
  authController.createManager,
);

module.exports = router;
