const User = require('../models/user-model');
const { validationResult } = require('express-validator');
const {
  successResponse,
  badRequestErrorResponse,
  internalServerErrorResponse,
} = require('../utils/response');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getSignedJwtRefreshToken();

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: 60 * 60 * 1000,
  });

  res.cookie('refreshToken', token, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  successResponse(res, 'User created successfully', {
    user,
    token,
    refreshToken,
  });
};

exports.register = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return badRequestErrorResponse(res, errors.array());
  }

  const { username, email, password } = req.body;

  try {
    const existingUser = await User.countDocuments({ email });
    if (existingUser) {
      return badRequestErrorResponse(res, 'User already exists');
    }

    const user = await User.create({
      username,
      email,
      password,
    });

    sendToken(user, 201, res);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};
