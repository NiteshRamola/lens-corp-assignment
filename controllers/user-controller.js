const { validationResult } = require('express-validator');
const { USER_ROLES } = require('../constants/user-constant');
const User = require('../models/user-model');
const { pagination } = require('../utils/pagination');
const {
  successResponse,
  badRequestErrorResponse,
} = require('../utils/response');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate([
      { path: 'managerId', select: 'username email' },
    ]);

    successResponse(res, 'User fetched', user);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const query = { _id: id };

    if (req.user.role === USER_ROLES.MANAGER) {
      query.managerId = req.user._id;
    }

    const user = await User.findOne(query).populate([
      { path: 'managerId', select: 'username email' },
    ]);

    if (!user) {
      return badRequestErrorResponse(res, 'User not found with given id.');
    }

    successResponse(res, 'User fetched', user);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.getUserList = async (req, res) => {
  try {
    const { search, limit, sort, page, role, managerId } = req.query;

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

    successResponse(res, 'Users fetched', data);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.assignManager = async (req, res) => {
  try {
    const { userId, managerId } = req.body;

    const user = await User.countDocuments({
      _id: userId,
      managerId: { $exists: false },
    });
    if (!user) {
      return badRequestErrorResponse(
        res,
        'Either user not exists or manager is already assigned.',
      );
    }

    const manager = await User.countDocuments({ _id: managerId });
    if (!manager) {
      return badRequestErrorResponse(res, 'Manager not found with given id.');
    }

    await User.updateOne({ _id: userId }, { $set: { managerId } });

    successResponse(res, 'Manager assigned successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.unassignManager = async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.countDocuments({
      _id: userId,
      managerId: { $exists: true },
    });
    if (!user) {
      return badRequestErrorResponse(
        res,
        'Either user not exists or manager is not assigned.',
      );
    }

    await User.updateOne({ _id: userId }, { $unset: { managerId: '' } });

    successResponse(res, 'Manager unassigned successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};
