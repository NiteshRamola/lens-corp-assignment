const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/auth-controller');

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

module.exports = router;
