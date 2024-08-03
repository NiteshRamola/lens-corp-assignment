const Task = require('../models/task-model');
const {
  internalServerErrorResponse,
  successResponse,
  badRequestErrorResponse,
} = require('../utils/response');
const { TASK_STATUS } = require('../constants/task-constant');
const User = require('../models/user-model');
const moment = require('moment');
const redis = require('../config/redis.config');
const { USER_ROLES } = require('../constants/user-constant');
const { pagination } = require('../utils/pagination');
const { sendEvent } = require('../utils/socket');

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, userId } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate: new Date(dueDate),
      priority,
      assignedTo: userId,
      createdBy: req.user._id,
    });

    await redis.deleteKeysByPattern('task_list_*');

    if (userId) {
      sendEvent('task-updates', userId.toString(), {
        type: 'newTask',
        msg: 'New Task Assigned',
        task,
      });
    }

    successResponse(res, 'Task created successfully', task);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, status, userId } = req.body;

    const query = { _id: id };

    let dataToUpdate = {};

    if (req.user.role === USER_ROLES.USER) {
      query.assignedTo = req.user._id;
      dataToUpdate.status = status;
    } else {
      query.createdBy = req.user._id;
      dataToUpdate = {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        status,
        assignedTo: userId,
      };
    }

    const updatedTask = await Task.findOneAndUpdate(query, dataToUpdate, {
      new: true,
    }).populate([
      { path: 'createdBy', select: 'username email' },
      { path: 'assignedTo', select: 'username email' },
    ]);

    if (!updatedTask) {
      return badRequestErrorResponse(res, 'Task not found with given id.');
    }

    const deleteCache = redis.deleteKeysByPattern(`task_list_*`);
    const updateCache = redis.setKey(`task_${id}`, updatedTask, 60 * 60);

    await Promise.allSettled([deleteCache, updateCache]);

    if (req.user.role === USER_ROLES.USER) {
      sendEvent('task-updates', updatedTask?.createdBy?._id?.toString(), {
        type: 'taskUpdated',
        msg: 'Task updated',
        task: updatedTask,
      });
    } else {
      sendEvent('task-updates', updatedTask?.assignedTo?._id?.toString(), {
        type: 'taskUpdated',
        msg: 'Task updated',
        task: updatedTask,
      });
    }

    successResponse(res, 'Task updated successfully', updatedTask);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const { id } = req.params;

    const cachedData = await redis.getKey(`task_${id}`);
    if (cachedData.success) {
      return successResponse(res, 'Task fetched', cachedData.data);
    }

    const query = { _id: id };

    if (req.user.role === USER_ROLES.MANAGER) {
      query.createdBy = req.user._id;
    }

    if (req.user.role === USER_ROLES.USER) {
      query.assignedTo = req.user._id;
    }

    const task = await Task.findOne(query).populate([
      { path: 'createdBy', select: 'username email' },
      { path: 'assignedTo', select: 'username email' },
    ]);

    if (!task) {
      return badRequestErrorResponse(res, 'Task not found with given id.');
    }

    await redis.setKey(`task_${id}`, task, 60 * 60);

    successResponse(res, 'Task fetched', task);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.getTaskList = async (req, res) => {
  try {
    const {
      search,
      limit,
      sort,
      page,
      userId,
      managerId,
      status,
      priority,
      dueDate,
    } = req.query;

    const cacheKey = `task_list_${JSON.stringify(req.query)}`;
    const cachedData = await redis.getKey(cacheKey);

    if (cachedData.success) {
      return successResponse(res, 'Tasks fetched', cachedData.data);
    }

    const query = {};

    if (userId) {
      query.assignedTo = userId === 'null' ? null : userId;
    }

    if (managerId) {
      query.createdBy = managerId;
    }

    if (req.user.role === USER_ROLES.MANAGER) {
      query.createdBy = req.user._id;
    }

    if (req.user.role === USER_ROLES.USER) {
      query.assignedTo = req.user._id;
    }

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (dueDate) {
      query.dueDate = {
        $gte: moment(dueDate).startOf('day').toDate(),
        $lte: moment(dueDate).endOf('day').toDate(),
      };
    }

    if (search) {
      query.$or = [
        {
          title: { $regex: search, $options: 'i' },
          description: { $regex: search, $options: 'i' },
        },
      ];
    }

    const data = await pagination(Task, query, page, limit, '', sort);

    await redis.setKey(cacheKey, data, 6 * 60 * 60);

    successResponse(res, 'Tasks fetched', data);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.assignUserToTask = async (req, res) => {
  try {
    const { userId, taskId } = req.body;

    const user = await User.countDocuments({
      _id: userId,
      role: USER_ROLES.USER,
    });
    if (!user) {
      return badRequestErrorResponse(res, 'User not found with given id.');
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: taskId,
        status: { $ne: TASK_STATUS.COMPLETED },
      },
      { assignedTo: userId },
      { new: true },
    ).populate([
      { path: 'createdBy', select: 'username email' },
      { path: 'assignedTo', select: 'username email' },
    ]);

    if (!task) {
      return badRequestErrorResponse(res, 'No task with given id found.');
    }

    const deleteCache = redis.deleteKeysByPattern(`task_list_*`);
    const updateCache = redis.setKey(`task_${taskId}`, task, 60 * 60);

    await Promise.allSettled([deleteCache, updateCache]);

    sendEvent('task-updates', userId.toString(), {
      type: 'newTask',
      msg: 'New Task Assigned',
      task,
    });

    successResponse(res, 'User assigned to task successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.unassignUserFromTask = async (req, res) => {
  try {
    const { taskId } = req.body;

    const taskExists = await Task.findOne(
      {
        _id: taskId,
        assignedTo: { $exists: true },
        status: { $ne: TASK_STATUS.COMPLETED },
      },
      { _id: 1, assignedTo: 1 },
    );

    if (!taskExists) {
      return badRequestErrorResponse(
        res,
        'Either user not assigned or task already completed.',
      );
    }

    const task = await Task.findByIdAndUpdate(
      taskExists._id,
      { $unset: { assignedTo: '' } },
      { new: true },
    ).populate([{ path: 'createdBy', select: 'username email' }]);

    const deleteCache = redis.deleteKeysByPattern(`task_list_*`);
    const updateCache = redis.setKey(`task_${taskId}`, task, 60 * 60);

    await Promise.allSettled([deleteCache, updateCache]);

    sendEvent('task-updates', taskExists?.assignedTo?.toString(), {
      type: 'taskRemoved',
      msg: 'Task unassigned',
      task,
    });

    successResponse(res, 'User unassigned from task successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};
