exports.newTaskAssignEmail = (
  username,
  title,
  description,
  dueDate,
  priority,
  status,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Task Assigned</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #007bff;
      color: #ffffff;
      padding: 10px;
      text-align: center;
    }
    .content {
      padding: 20px;
    }
    .content h1 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Task Management System</h2>
    </div>
    <div class="content">
      <h1>New Task Assigned</h1>
      <p>Dear ${username},</p>
      <p>You have been assigned a new task:</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p>Please log in to your account to view and manage your tasks.</p>
      <p>Best regards,<br>Task Management Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Task Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

exports.taskUpdateEmail = (
  username,
  title,
  description,
  dueDate,
  priority,
  status,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Updated</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #007bff;
      color: #ffffff;
      padding: 10px;
      text-align: center;
    }
    .content {
      padding: 20px;
    }
    .content h1 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Task Management System</h2>
    </div>
    <div class="content">
      <h1>Task Updated</h1>
     <p>Dear ${username},</p>
      <p>The task assigned to you has been updated:</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p>Please log in to your account to view and manage your tasks.</p>
      <p>Best regards,<br>Task Management Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Task Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

exports.taskUnAssignEmail = (
  username,
  title,
  description,
  dueDate,
  priority,
  status,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Unassigned</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #007bff;
      color: #ffffff;
      padding: 10px;
      text-align: center;
    }
    .content {
      padding: 20px;
    }
    .content h1 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Task Management System</h2>
    </div>
    <div class="content">
      <h1>Task Unassigned</h1>
      <p>Dear ${username},</p>
      <p>You have been unassigned from the task:</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p>Please log in to your account to view and manage your tasks.</p>
      <p>Best regards,<br>Task Management Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Task Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

exports.taskDueReminderEmail = (
  username,
  title,
  description,
  dueDate,
  priority,
  status,
) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Task Due Reminder</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 100%;
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      padding: 20px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      background-color: #007bff;
      color: #ffffff;
      padding: 10px;
      text-align: center;
    }
    .content {
      padding: 20px;
    }
    .content h1 {
      font-size: 24px;
      margin-bottom: 20px;
    }
    .content p {
      font-size: 16px;
      line-height: 1.5;
      margin-bottom: 20px;
    }
    .footer {
      text-align: center;
      padding: 10px;
      font-size: 12px;
      color: #888888;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Task Management System</h2>
    </div>
    <div class="content">
      <h1>Reminder: Task Due Soon</h1>
      <p>Dear ${username},</p>
      <p>This is a reminder that the following task is due today:</p>
      <p><strong>Title:</strong> ${title}</p>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Due Date:</strong> ${dueDate}</p>
      <p><strong>Priority:</strong> ${priority}</p>
      <p><strong>Status:</strong> ${status}</p>
      <p>Please make sure to complete the task by end of the day today to avoid any delays.</p>
      <p>If you have any questions or need assistance, feel free to reach out to your project manager.</p>
      <p>Best regards,<br>Task Management Team</p>
    </div>
    <div class="footer">
      <p>&copy; 2024 Task Management System. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;
