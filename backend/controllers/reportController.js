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
const exportUsersReport = async (req, res) => {
  try {
    // 1. FETCH USERS AND THEIR TASKS
    // Fetch all users (lean for performance), select name and email
    const users = await User.find().select("name email").lean();

    // Fetch all tasks and populate 'assignedTo' field
    const userTasks = await Task.find().populate("assignedTo", "name email");

    // 2. MAP TO STORE AGGREGATED USER TASK DATA
    const userTaskMap = {};

    // Initialize each user's task stats
    users.forEach((user) => {
      userTaskMap[user._id] = {
        name: user.name,
        email: user.email,
        taskCount: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
      };
    });

    // 3. PROCESS EACH TASK AND AGGREGATE COUNTS
    userTasks.forEach((task) => {
      const assignedUser = task.assignedTo;
      if (assignedUser && userTaskMap[assignedUser._id]) {
        userTaskMap[assignedUser._id].taskCount += 1;

        if (task.status === "Pending") {
          userTaskMap[assignedUser._id].pendingTasks += 1;
        } else if (task.status === "In Progress") {
          userTaskMap[assignedUser._id].inProgressTasks += 1;
        } else if (task.status === "Completed") {
          userTaskMap[assignedUser._id].completedTasks += 1;
        }
      }
    });

    // 4. PREPARE EXCEL SHEET
    const workbook = new excelJS.Workbook();
    const worksheet = workbook.addWorksheet("User Task Report");

    // Define headers/columns
    worksheet.columns = [
      { header: "User Name", key: "name", width: 30 },
      { header: "Email", key: "email", width: 40 },
      { header: "Total Assigned Tasks", key: "taskCount", width: 20 },
      { header: "Pending Tasks", key: "pendingTasks", width: 20 },
      { header: "In Progress Tasks", key: "inProgressTasks", width: 20 },
      { header: "Completed Tasks", key: "completedTasks", width: 20 },
    ];

    // Add a row per user
    Object.values(userTaskMap).forEach((user) => {
      worksheet.addRow(user);
    });

    // 5. SET HEADERS FOR DOWNLOAD AND STREAM FILE
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="users_report.xlsx"'
    );

    // Stream Excel workbook to the response
    await workbook.xlsx.write(res);
    res.end(); // Ensure the response ends after writing the file

  } catch (error) {
    // 6. ERROR HANDLING
    console.error("User Export Error:", error);
    res.status(500).json({
      message: "Error exporting users",
      error: error.message,
    });
  }
};

module.exports = {
  exportTasksReport,
  exportUsersReport,
};
