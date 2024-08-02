const { USER_ROLES } = require('../constants/user-constant');
const User = require('../models/user-model');
const { pagination } = require('../utils/pagination');
const {
  successResponse,
  badRequestErrorResponse,
} = require('../utils/response');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    successResponse(res, 'User fetched', user);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

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
    const { search, limit, sort, page, role } = req.query;

    const query = {
      role: { $ne: USER_ROLES.ADMIN },
    };

    if (role) {
      query.role = role;
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
