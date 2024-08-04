exports.newTaskAssignSMS = (
  username,
  title,
  description,
  dueDate,
  priority,
  status,
) =>
  `
Hi ${username}, you have been assigned a new task: "${title}". 

Description: ${description} 
Due Date: ${dueDate} 
Priority: ${priority} 
Status: ${status} 

Please log in to your account to view and manage this task. 
Task Management Team
`;

exports.taskUpdateSMS = (
  username,
  title,
  description,
  dueDate,
  priority,
  status,
) =>
  `
Hi ${username}, your task "${title}" has been updated. 

Description: ${description}
Due Date: ${dueDate}
Priority: ${priority}
Status: ${status}

Log in to your account for more details.  
Task Management Team
`;

exports.taskUnAssignSMS = (
  username,
  title,
  description,
  dueDate,
  priority,
  status,
) =>
  `
Hi ${username}, you have been unassigned from the task: "${title}". 

Description: ${description} 
Due Date: ${dueDate} 
Priority: ${priority} 
Status: ${status}

Log in to your account for more details. 
Task Management Team
`;

exports.taskDueReminderSMS = (
  username,
  title,
  description,
  dueDate,
  priority,
  status,
) =>
  `
Hi ${username}, this is a reminder that your task "${title}" is due today. 

Description: ${description} 
Due Date: ${dueDate} 
Priority: ${priority} 
Status: ${status}

Please complete it by end of the day today. 
Task Management Team
`;
