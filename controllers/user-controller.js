const redis = require('../config/redis.config');
const { USER_ROLES } = require('../constants/user-constant');
const User = require('../models/user-model');
const { pagination } = require('../utils/pagination');
const {
  successResponse,
  badRequestErrorResponse,
  internalServerErrorResponse,
} = require('../utils/response');

exports.getProfile = async (req, res) => {
  try {
    const cachedData = await redis.getKey(`user_${req.user._id}`);
    if (cachedData.success) {
      return successResponse(res, 'User fetched', cachedData.data);
    }

    const user = await User.findById(req.user._id).populate([
      { path: 'managerId', select: 'username email phone' },
    ]);

    await redis.setKey(`user_${req.user._id}`, user, 60 * 60);

    successResponse(res, 'User fetched', user);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const cachedData = await redis.getKey(`user_${id}`);
    if (cachedData.success) {
      return successResponse(res, 'User fetched', cachedData.data);
    }

    const query = { _id: id };

    if (req.user.role === USER_ROLES.MANAGER) {
      query.managerId = req.user._id;
    }

    const user = await User.findOne(query).populate([
      { path: 'managerId', select: 'username email phone' },
    ]);

    if (!user) {
      return badRequestErrorResponse(res, 'User not found with given id.');
    }

    await redis.setKey(`user_${id}`, user, 60 * 60);

    successResponse(res, 'User fetched', user);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.getUserList = async (req, res) => {
  try {
    const { search, limit, sort, page, role, managerId } = req.query;

    const cacheKey = `user_list_${JSON.stringify(req.query)}`;
    const cachedData = await redis.getKey(cacheKey);

    if (cachedData.success) {
      return successResponse(res, 'Users fetched', cachedData.data);
    }

    const query = {
      role: { $ne: USER_ROLES.ADMIN },
    };

    if (role) {
      query.role = role;
    }

    if (managerId) {
      query.managerId = managerId === 'null' ? null : managerId;
    }

    if (req.user.role === USER_ROLES.MANAGER) {
      query.managerId = req.user._id;
    }

    if (search) {
      query.$or = [
        {
          username: { $regex: search, $options: 'i' },
          email: { $regex: search, $options: 'i' },
        },
      ];
    }

    const data = await pagination(User, query, page, limit, '', sort);

    await redis.setKey(cacheKey, data, 6 * 60 * 60);

    successResponse(res, 'Users fetched', data);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.assignManager = async (req, res) => {
  try {
    const { userId, managerId } = req.body;

    const manager = await User.countDocuments({ _id: managerId });
    if (!manager) {
      return badRequestErrorResponse(res, 'Manager not found with given id.');
    }

    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        managerId: { $exists: false },
        role: USER_ROLES.USER,
      },
      { managerId },
      { new: true },
    ).populate([{ path: 'managerId', select: 'username email phone' }]);

    if (!user) {
      return badRequestErrorResponse(
        res,
        'Either user not exists or manager is already assigned.',
      );
    }

    const deleteCache = redis.deleteKeysByPattern(`user_list_*`);
    const updateCache = redis.setKey(`user_${userId}`, user, 60 * 60);

    await Promise.allSettled([deleteCache, updateCache]);

    successResponse(res, 'Manager assigned successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.unassignManager = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findByIdAndUpdate(
      {
        _id: userId,
        managerId: { $exists: true },
        role: USER_ROLES.USER,
      },
      { $unset: { managerId: '' } },
      { new: true },
    );

    if (!user) {
      return badRequestErrorResponse(
        res,
        'Either user not exists or manager is not assigned.',
      );
    }

    const deleteCache = redis.deleteKeysByPattern(`user_list_*`);
    const updateCache = redis.setKey(`user_${userId}`, user, 60 * 60);

    await Promise.allSettled([deleteCache, updateCache]);
    successResponse(res, 'Manager unassigned successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};
