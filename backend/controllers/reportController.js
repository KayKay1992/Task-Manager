const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

//@desc export all tasks as excel file
//@route GET/api/reports/export/tasks
//access private(admin)
const exportTasksReport = async (req, res) => {
    try {
      // 1. FETCH TASK DATA
      // Get all tasks and populate 'assignedTo' field with user name and email
      const tasks = await Task.find().populate("assignedTo", "name email");
  
      // 2. INITIALIZE EXCEL WORKBOOK & SHEET
      const workbook = new excelJS.Workbook();
      const worksheet = workbook.addWorksheet("Task Report");
  
      // 3. DEFINE COLUMNS FOR THE EXCEL SHEET
      worksheet.columns = [
        { header: "Task ID", key: "_id", width: 25 },
        { header: "Title", key: "title", width: 30 },
        { header: "Description", key: "description", width: 30 },
        { header: "Priority", key: "priority", width: 15 },
        { header: "Status", key: "status", width: 20 },
        { header: "Due Date", key: "dueDate", width: 20 },
        { header: "Assigned To", key: "assignedTo", width: 30 },
      ];
  
      // 4. POPULATE ROWS IN THE SHEET
      tasks.forEach((task) => {
        // Format assignedTo as "Name (email)" or fallback to "Unassigned"
        const assignedUser = task.assignedTo
          ? `${task.assignedTo.name} (${task.assignedTo.email})`
          : "Unassigned";
  
        worksheet.addRow({
          _id: task._id,
          title: task.title,
          description: task.description,
          priority: task.priority,
          status: task.status,
          dueDate: task.dueDate.toISOString().split("T")[0], // format date
          assignedTo: assignedUser,
        });
      });
  
      // 5. SET RESPONSE HEADERS FOR DOWNLOAD
      res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      res.setHeader(
        "Content-Disposition",
        'attachment; filename="tasks_report.xlsx"' // ✅ fixed 'attachement' typo and extension
      );
  
      // 6. STREAM EXCEL FILE TO CLIENT
      await workbook.xlsx.write(res);
      res.end(); // ✅ properly ends the response
    } catch (error) {
      // 7. HANDLE ERRORS
      console.error("Export error:", error);
      res.status(500).json({
        message: "Error exporting tasks",
        error: error.message,
      });
    }
  };
  

//@desc export user-task as excel file
//@route GET/api/reports/export/users
//access private(admin)

const mongoose = require('mongoose');


const exportUsersReport = async (req, res) => {
  try {
    // 1. FETCH USERS
    const users = await User.find().select('_id name email').lean();
    console.log(`Fetched ${users.length} users`);

    // 2. MAP TO STORE AGGREGATED USER TASK DATA
    const userTaskMap = {};
    users.forEach((user) => {
      userTaskMap[user._id.toString()] = {
        name: user.name || 'Unknown',
        email: user.email || 'N/A',
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    // 3. FETCH AND PROCESS TASKS
    const tasks = await Task.find().populate({
      path: 'assignedTo',
      select: 'name email',
    }).lean();
    console.log(`Fetched ${tasks.length} tasks`);

    tasks.forEach(task => {
      console.log(`Task ${task._id}: status=${task.status}, assignedTo=${task.assignedTo ? task.assignedTo.map(u => u._id).join(', ') : 'null'}`);
      
      // Skip tasks with no assigned users
      if (!task.assignedTo || !Array.isArray(task.assignedTo) || task.assignedTo.length === 0) {
        console.warn(`Skipping task ${task._id}: No valid assignedTo`);
        return;
      }

      // Process each user in the assignedTo array
      task.assignedTo.forEach(user => {
        if (!user || !mongoose.Types.ObjectId.isValid(user._id)) {
          console.warn(`Skipping invalid user in task ${task._id}`);
          return;
        }

        const userId = user._id.toString();
        if (userTaskMap[userId]) {
          userTaskMap[userId].taskCount += 1;
          console.log(`Incremented taskCount for user ${userId}: ${userTaskMap[userId].taskCount}`);

          const status = task.status ? task.status.toLowerCase() : '';
          console.log(`Task ${task._id} status: ${status}`);
          switch (status) {
            case 'pending':
              userTaskMap[userId].pendingTasks += 1;
              console.log(`Incremented pendingTasks for user ${userId}: ${userTaskMap[userId].pendingTasks}`);
              break;
            case 'in progress':
              userTaskMap[userId].inProgressTasks += 1;
              console.log(`Incremented inProgressTasks for user ${userId}: ${userTaskMap[userId].inProgressTasks}`);
              break;
            case 'completed':
              userTaskMap[userId].completedTasks += 1;
              console.log(`Incremented completedTasks for user ${userId}: ${userTaskMap[userId].completedTasks}`);
              break;
            default:
              console.warn(`Task ${task._id} has invalid status: ${task.status}`);
          }
        } else {
          console.warn(`User ${userId} not found in userTaskMap for task ${task._id}`);
        }
      });
    });

    console.log('User Task Map:', JSON.stringify(userTaskMap, null, 2));

    // 4. PREPARE EXCEL SHEET
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet('User Task Report');

    worksheet.columns = [
      { header: 'User Name', key: 'name', width: 30 },
      { header: 'Email', key: 'email', width: 40 },
      { header: 'Total Assigned Tasks', key: 'taskCount', width: 20 },
      { header: 'Pending Tasks', key: 'pendingTasks', width: 20 },
      { header: 'In Progress Tasks', key: 'inProgressTasks', width: 20 },
      { header: 'Completed Tasks', key: 'completedTasks', width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    // 5. SET HEADERS FOR DOWNLOAD
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="users_report.xlsx"'
    );

    await workbook.xlsx.write(res);

  } catch (error) {
    console.error('User Export Error:', error.stack);
    if (!res.headersSent) {
      res.status(500).json({
        message: 'Error exporting users',
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      });
    }
  }
};


module.exports = {
  exportTasksReport,
  exportUsersReport,
};
