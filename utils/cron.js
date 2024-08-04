const schedule = require('node-schedule');
const { sendTaskDueDateReminders } = require('../controllers/task-controller');

schedule.scheduleJob('* * * * *', () => {
  try {
    logger.log('Running Task due date reminder at 12 AM');

    sendTaskDueDateReminders();
  } catch (error) {
    logger.log(`Failed to send task due date reminders: ${error}`, 'error');
  }
});
