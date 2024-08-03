const User = require('../models/user-model');
const {
  successResponse,
  badRequestErrorResponse,
  internalServerErrorResponse,
} = require('../utils/response');
const redis = require('../config/redis.config');
const { USER_ROLES } = require('../constants/user-constant');

const sendToken = async (res, user, msg) => {
  const token = user.getSignedJwtToken();
  const refreshToken = user.getSignedJwtRefreshToken();

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: true,
    maxAge: 60 * 60 * 1000,
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    sameSite: 'Strict',
    secure: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  await redis.setKey(refreshToken, user._id, 7 * 24 * 60 * 60);

  successResponse(res, msg, {
    user: {
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  });
};

const createUser = async (email, username, password, role) => {
  try {
    const userExists = await User.findOne({
      $or: [{ email: email }, { username: username }],
    }).select({
      _id: 0,
      email: 1,
      username: 1,
    });
    if (userExists) {
      const errorMessage =
        userExists.email === email
          ? 'User with same email already exists'
          : 'Username already taken';

      return { success: false, errorMessage };
    }

    const user = await User.create({
      username,
      email,
      password,
      role,
    });

    await redis.deleteKeysByPattern('user_list_*');

    return { success: true, user };
  } catch (error) {
    throw new Error(error);
  }
};

exports.createAdminOnServerStart = async () => {
  try {
    const admin = await User.countDocuments({ role: USER_ROLES.ADMIN });

    if (!admin) {
      await User.create({
        username: 'Admin',
        email: 'admin@gmail.com',
        password: 'Admin@123',
        role: USER_ROLES.ADMIN,
      });

      logger.log('Admin created successfully.');

      return true;
    }

    logger.log('Admin already exists');

    return true;
  } catch (error) {
    throw new Error(error);
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const createdUser = await createUser(email, username, password);

    if (!createdUser.success) {
      return badRequestErrorResponse(res, createdUser.errorMessage);
    }

    sendToken(res, createdUser.user, 'User created successfully');
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
      await redis.deleteKey(refreshToken);
    }

    res.clearCookie('token');
    res.clearCookie('refreshToken');

    successResponse(res, 'Logout success');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.createManager = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const createdUser = await createUser(
      email,
      username,
      password,
      USER_ROLES.MANAGER,
    );

    if (!createdUser.success) {
      return badRequestErrorResponse(res, createdUser.errorMessage);
    }

    successResponse(res, 'Manager created successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};
