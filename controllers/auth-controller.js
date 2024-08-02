const User = require('../models/user-model');
const { validationResult } = require('express-validator');
const {
  successResponse,
  badRequestErrorResponse,
  internalServerErrorResponse,
} = require('../utils/response');
const redis = require('../config/redis.config');

const sendToken = async (res, user, msg) => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getSignedJwtRefreshToken();

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'None',
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await redis.set(refreshToken, user._id, 'EX', 7 * 24 * 60 * 60);

  successResponse(res, msg, {
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
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

    sendToken(res, user, 'User created successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select(
      '_id email password username role',
    );
    if (!user) {
      return badRequestErrorResponse(res, 'Invalid credentials');
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return badRequestErrorResponse(res, 'Invalid credentials');
    }

    sendToken(res, user, 'Login success');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      await redis.del(refreshToken);
    }

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    successResponse(res, 'Logout success');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};
