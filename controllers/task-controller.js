const Task = require('../models/task-model');
const mongoose = require('mongoose');
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
const {
  newTaskAssignSMS,
  taskUpdateSMS,
  taskUnAssignSMS,
  taskDueReminderSMS,
} = require('../utils/smsTemplates');
const {
  newTaskAssignEmail,
  taskUpdateEmail,
  taskUnAssignEmail,
  taskDueReminderEmail,
} = require('../utils/emailTemplates');
const sendEmail = require('../config/email.config');
const sendMessage = require('../config/sms.config');

exports.createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, userId } = req.body;

    let user;
    if (userId) {
      user = await User.findById(userId).select('username email phone');

      if (!user) {
        return badRequestErrorResponse(res, 'Invalid user id');
      }
    }

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

      const emailTemplate = newTaskAssignEmail(
        user.username,
        title,
        description,
        moment(dueDate).format('DD-MM-YYYY'),
        priority,
        TASK_STATUS.PENDING,
      );

      const smsTemplate = newTaskAssignSMS(
        user.username,
        title,
        description,
        moment(dueDate).format('DD-MM-YYYY'),
        priority,
        TASK_STATUS.PENDING,
      );

      sendEmail(user.email, 'New Task Assigned', emailTemplate);
      sendMessage(smsTemplate, user.phone);
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
      { path: 'createdBy', select: 'username email phone' },
      { path: 'assignedTo', select: 'username email phone' },
    ]);

    if (!updatedTask) {
      return badRequestErrorResponse(res, 'Task not found with given id.');
    }

    const deleteCache = redis.deleteKeysByPattern(`task_list_*`);
    const deleteAnalyticsCache = redis.deleteKeysByPattern(`task_analytics_*`);
    const updateCache = redis.setKey(`task_${id}`, updatedTask, 60 * 60);

    await Promise.allSettled([deleteCache, deleteAnalyticsCache, updateCache]);

    if (req.user.role === USER_ROLES.USER) {
      sendEvent('task-updates', updatedTask?.createdBy?._id?.toString(), {
        type: 'taskUpdated',
        msg: 'Task updated',
        task: updatedTask,
      });
    } else if (updatedTask?.assignedTo?._id) {
      sendEvent('task-updates', updatedTask?.assignedTo?._id?.toString(), {
        type: 'taskUpdated',
        msg: 'Task updated',
        task: updatedTask,
      });

      const emailTemplate = taskUpdateEmail(
        updatedTask?.assignedTo?.username,
        updatedTask.title,
        updatedTask.description,
        moment(updatedTask.dueDate).format('DD-MM-YYYY'),
        updatedTask.priority,
        updatedTask.status,
      );

      const smsTemplate = taskUpdateSMS(
        updatedTask?.assignedTo?.username,
        updatedTask.title,
        updatedTask.description,
        moment(updatedTask.dueDate).format('DD-MM-YYYY'),
        updatedTask.priority,
        updatedTask.status,
      );

      sendEmail(updatedTask?.assignedTo?.email, 'Task Updated', emailTemplate);
      sendMessage(smsTemplate, updatedTask?.assignedTo?.phone);
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
      { path: 'createdBy', select: 'username email phone' },
      { path: 'assignedTo', select: 'username email phone' },
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
      { path: 'createdBy', select: 'username email phone' },
      { path: 'assignedTo', select: 'username email phone' },
    ]);

    if (!task) {
      return badRequestErrorResponse(res, 'No task with given id found.');
    }

    const deleteCache = redis.deleteKeysByPattern(`task_list_*`);
    const deleteAnalyticsCache = redis.deleteKeysByPattern(`task_analytics_*`);
    const updateCache = redis.setKey(`task_${taskId}`, task, 60 * 60);

    await Promise.allSettled([deleteCache, deleteAnalyticsCache, updateCache]);

    sendEvent('task-updates', userId.toString(), {
      type: 'newTask',
      msg: 'New Task Assigned',
      task,
    });

    const emailTemplate = newTaskAssignEmail(
      task?.assignedTo?.username,
      task.title,
      task.description,
      moment(task.dueDate).format('DD-MM-YYYY'),
      task.priority,
      task.status,
    );

    const smsTemplate = newTaskAssignSMS(
      task?.assignedTo?.username,
      task.title,
      task.description,
      moment(task.dueDate).format('DD-MM-YYYY'),
      task.priority,
      task.status,
    );

    sendEmail(task?.assignedTo?.email, 'New Task Assigned', emailTemplate);
    sendMessage(smsTemplate, task?.assignedTo?.phone);

    successResponse(res, 'User assigned to task successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.unassignUserFromTask = async (req, res) => {
  try {
    const { taskId } = req.body;

    const taskExists = await Task.findOne({
      _id: taskId,
      assignedTo: { $exists: true },
      status: { $ne: TASK_STATUS.COMPLETED },
    }).populate([{ path: 'assignedTo', select: 'username email phone' }]);

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
    ).populate([{ path: 'createdBy', select: 'username email phone' }]);

    const deleteCache = redis.deleteKeysByPattern(`task_list_*`);
    const deleteAnalyticsCache = redis.deleteKeysByPattern(`task_analytics_*`);
    const updateCache = redis.setKey(`task_${taskId}`, task, 60 * 60);

    await Promise.allSettled([deleteCache, deleteAnalyticsCache, updateCache]);

    sendEvent('task-updates', taskExists?.assignedTo?._id?.toString(), {
      type: 'taskRemoved',
      msg: 'Task unassigned',
      task,
    });

    const emailTemplate = taskUnAssignEmail(
      taskExists?.assignedTo?.username,
      taskExists.title,
      taskExists.description,
      moment(taskExists.dueDate).format('DD-MM-YYYY'),
      taskExists.priority,
      taskExists.status,
    );

    const smsTemplate = taskUnAssignSMS(
      taskExists?.assignedTo?.username,
      taskExists.title,
      taskExists.description,
      moment(taskExists.dueDate).format('DD-MM-YYYY'),
      taskExists.priority,
      taskExists.status,
    );

    sendEmail(
      taskExists?.assignedTo?.email,
      'New Task Assigned',
      emailTemplate,
    );
    sendMessage(smsTemplate, taskExists?.assignedTo?.phone);

    successResponse(res, 'User unassigned from task successfully');
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.getTaskAnalytics = async (req, res) => {
  try {
    const { userId, managerId } = req.query;

    const cacheKey = `task_analytics_${JSON.stringify(req.query)}`;
    const cachedData = await redis.getKey(cacheKey);

    if (cachedData.success) {
      return successResponse(res, 'Task analytics fetched', cachedData.data);
    }

    const query = {};

    if (userId) {
      query.assignedTo = new mongoose.Types.ObjectId(userId);
    }

    if (managerId) {
      query.createdBy = new mongoose.Types.ObjectId(managerId);
    }

    if (req.user.role === USER_ROLES.USER) {
      query.assignedTo = new mongoose.Types.ObjectId(req.user._id);
    }

    if (req.user.role === USER_ROLES.MANAGER) {
      query.createdBy = new mongoose.Types.ObjectId(req.user._id);
    }

    const [data] = await Task.aggregate([
      { $match: query },
      {
        $facet: {
          totalTasks: [{ $count: 'count' }],
          completedTasks: [
            { $match: { status: TASK_STATUS.COMPLETED } },
            { $count: 'count' },
          ],
          pendingTasks: [
            { $match: { status: TASK_STATUS.PENDING } },
            { $count: 'count' },
          ],
          inProgressTasks: [
            { $match: { status: TASK_STATUS.IN_PROGRESS } },
            { $count: 'count' },
          ],
          overdueTasks: [
            {
              $match: {
                status: { $in: [TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS] },
                dueDate: { $lt: new Date() },
              },
            },
            { $count: 'count' },
          ],
        },
      },
      {
        $project: {
          totalTasks: {
            $ifNull: [{ $arrayElemAt: ['$totalTasks.count', 0] }, 0],
          },
          completedTasks: {
            $ifNull: [{ $arrayElemAt: ['$completedTasks.count', 0] }, 0],
          },
          pendingTasks: {
            $ifNull: [{ $arrayElemAt: ['$pendingTasks.count', 0] }, 0],
          },
          inProgressTasks: {
            $ifNull: [{ $arrayElemAt: ['$inProgressTasks.count', 0] }, 0],
          },
          overdueTasks: {
            $ifNull: [{ $arrayElemAt: ['$overdueTasks.count', 0] }, 0],
          },
        },
      },
    ]);

    await redis.setKey(cacheKey, data, 60 * 60);

    successResponse(res, 'Task analytics fetched', data);
  } catch (error) {
    internalServerErrorResponse(res, error);
  }
};

exports.sendTaskDueDateReminders = async () => {
  try {
    const tasks = Task.find({
      status: { $in: [TASK_STATUS.PENDING, TASK_STATUS.IN_PROGRESS] },
      dueDate: { $gte: moment().startOf('day'), $lte: moment().endOf('day') },
    })
      .populate([{ path: 'assignedTo', select: 'username email phone' }])
      .cursor();

    for await (let task of tasks) {
      const emailTemplate = taskDueReminderEmail(
        task?.assignedTo?.username,
        task.title,
        task.description,
        moment(task.dueDate).format('DD-MM-YYYY'),
        task.priority,
        task.status,
      );

      const smsTemplate = taskDueReminderSMS(
        task?.assignedTo?.username,
        task.title,
        task.description,
        moment(task.dueDate).format('DD-MM-YYYY'),
        task.priority,
        task.status,
      );

      sendEmail(task?.assignedTo?.email, 'New Task Assigned', emailTemplate);
      sendMessage(smsTemplate, task?.assignedTo?.phone);
    }

    logger.log('Task due date reminders sent successfully');
  } catch (error) {
    logger.log(`Error from sendTaskDueDateReminders: ${error}`, 'error');
  }
};
