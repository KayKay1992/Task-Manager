const { array } = require("../middlewares/uploadMiddleware");
const Task = require("../models/Task");

//@desc GET all tasks (Admin: all, User: only assigned tasks)
//@route GET api/tasks/
//@access Private
const getTasks = async (req, res) => {
  try {
    const { status } = req.query; // Changed from req.body to req.query
    let filter = {};

    if (status && status.trim() !== '') {
      filter.status = status; // Actually assign the status value
    }

    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find(filter).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    } else {
      tasks = await Task.find({ 
        ...filter, 
        assignedTo: req.user._id 
      }).populate(
        "assignedTo",
        "name email profileImageUrl"
      );
    }

    // Add completed todoChecklist count to each task
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return { ...task._doc, completedTodoCount: completedCount };
      })
    );

    // Status summary count
    const baseFilter = req.user.role === "admin" ? {} : { assignedTo: req.user._id };

    const allTasks = await Task.countDocuments(baseFilter);
    const pendingTasks = await Task.countDocuments({ 
      ...baseFilter,
      status: "Pending" 
    });
    const inProgressTasks = await Task.countDocuments({ 
      ...baseFilter,
      status: "In Progress" 
    });
    const completedTasks = await Task.countDocuments({ 
      ...baseFilter,
      status: "Completed" 
    });

    res.json({
      tasks,
      StatusSummary: {  // Changed to match frontend expectation
        all: allTasks,
        PendingTasks: pendingTasks,  // Changed to match frontend
        InProgressTasks: inProgressTasks,  // Changed to match frontend
        CompletedTasks: completedTasks  // Changed to match frontend
      }
    });
  } catch (error) {
    console.error("Error in getTasks:", error);
    res.status(500).json({
      message: "Server Error",
      error: error.message,
    });
  }
};

//@desc GET task by ID
//@route GET/api/tasks/:id
//@access private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json(task);
  } catch (error) {
    res.status(500).json({
      messaage: "Server Error",
      error: error.message,
    });
  }
};

//@desc create a new task
//@route POST/api/tasks/
//@access admin private
const createTask = async (req, res) => {
  try {
    const {
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
    } = req.body;

    if (!Array.isArray(assignedTo)) {
      return res.status(400).json({
        message: "Assigned to must be an array of user ids",
      });
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      attachments,
      todoChecklist,
      createdBy: req.user._id,
    });
    res.status(201).json({
      message: "Task created successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      messaage: "Server Error",
      error: error.messaage,
    });
  }
};

//@desc update a task
//@route PUT/api/tasks/:id
//@access private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res.status(404).json({
        message: "Task not found",
      });

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return res.status(400).json({
          message: "assignedTo must be array of users IDs",
        });
      }
      task.assignedTo = req.body.assignedTo;
    }

    const updatedTask = await task.save();

    res.json({
      message: "Task updated successfully",
      updatedTask,
    });
  } catch (error) {
    res.status(500).json({
      messaage: "Server Error",
      error: error.message,
    });
  }
};

//@desc Delete a task (Admin only)
//@route DELETE/api/tasks/:id
//@access private/admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task)
      return res.status(404).json({
        message: "task not found",
      });

    await task.deleteOne();
    res.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      messaage: "Server Error",
      error: error.message,
    });
  }
};

//@desc update task status
//@route PUT api/tasks/:id/status
//@access private
const updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user is assigned to task (unless admin)
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not Authorized" });
    }

    // Fix: Corrected typo from 'staus' to 'status'
    task.status = req.body.status || task.status;

    // If status is 'Completed', mark all checklist items as complete
    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    // Mark the checklist as modified since we changed it
    if (task.status === "Completed") {
      task.markModified("todoChecklist");
    }

    const updatedTask = await task.save();

    res.json({
      message: "Task status updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({
      message: "Server Error", // Fixed typo from 'messaage'
      error: error.message,
    });
  }
};

//@desc update task checklist
//@route PUT api/tasks/:id/todo
//@access private
const updateTaskChecklist = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Authorization check
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );

    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not Authorized to Update Checklist",
      });
    }

    // Update the checklist with the one from request body
    if (req.body.todoChecklist) {
      task.todoChecklist = req.body.todoChecklist;
      task.markModified("todoChecklist"); // Mark as modified
    }

    // Calculate progress
    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;

    const totalItems = task.todoChecklist.length;
    task.progress =
      totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

    // Update status based on progress
    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    const updatedTask = await task.save();

    // Get fresh task data with populated assignedTo
    const populatedTask = await Task.findById(updatedTask._id).populate(
      "assignedTo",
      "name email profileImageUrl"
    );

    res.json({
      message: "Task checklist updated successfully", // Fixed typo
      task: populatedTask,
    });
  } catch (error) {
    console.error("Update checklist error:", error);
    res.status(500).json({
      message: "Server Error", // Fixed typo
      error: error.message,
    });
  }
};
//@dashboard data admin
//@route GET api/tasks/dashboard-data
//@access Private
const getDashboardData = async (req, res) => {
  try {
    // 1. FETCH BASIC STATISTICS
    // Count all tasks in the database
    const totalTasks = await Task.countDocuments();
    
    // Count tasks with "Pending" status
    const pendingTasks = await Task.countDocuments({
      status: "Pending",
    });
    
    // Count tasks with "Completed" status
    const completedTasks = await Task.countDocuments({
      status: "Completed",
    });
    
    // Count overdue tasks (not completed and due date passed)
    const overdueTasks = await Task.countDocuments({
      status: { $ne: "Completed" }, // Not equal to Completed
      dueDate: { $lt: new Date() }, // Less than current date
    });

    // 2. TASK DISTRIBUTION BY STATUS
    // Define all possible status values we want to track
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    
    // Aggregate tasks by status (raw data from MongoDB)
    const taskDistributionRaw = await Task.aggregate([
      {
        $group: {
          _id: "$status", // Group by status field
          count: { $sum: 1 }, // Count documents in each group (fixed $sum typo)
        },
      },
    ]);
    
    // Transform raw data into a consistent format including all statuses
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response keys
      acc[formattedKey] = 
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});
    
    taskDistribution["All"] = totalTasks; // Add total count

    // 3. TASK PRIORITY DISTRIBUTION
    // Define expected priority levels (missing in original code - added)
    const taskPriorities = ["Low", "Medium", "High"]; 
    
    // Aggregate tasks by priority (fixed typo: aggregrate -> aggregate)
    const taskPriorityLevelsRaw = await Task.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 }, // Fixed $sum typo
        },
      },
    ]);
    
    // Transform priority data to include all levels
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] = 
        taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc; // Added missing return
    }, {});

    // 4. RECENT TASKS
    // Get 10 most recently created tasks with selected fields
    const recentTasks = await Task.find()
      .sort({ createdAt: -1 }) // Newest first
      .limit(10)
      .select("title status priority dueDate createdAt"); // Only these fields

    // 5. RETURN COMPREHENSIVE DASHBOARD DATA
    res.status(200).json({
      statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
      },
      charts: {
        taskDistribution, // By status
        taskPriorityLevels, // By priority
      },
      recentTasks, // Recent activity
    });

  } catch (error) {
    // 6. ERROR HANDLING
    console.error("Dashboard error:", error); // Log for debugging
    res.status(500).json({
      message: "Server Error", // Fixed typo
      error: error.message, // Fixed typo
    });
  }
};


//@dashboard data user specific
//@route GET api/tasks/user-dashboard-data
//@access Private

const getUserDashboardData = async (req, res) => {
  try {
    // Get the authenticated user's ID from the request
    const userId = req.user._id;

    // 1. FETCH BASIC STATISTICS FOR USER'S TASKS
    // Count all tasks assigned to this user
    const totalTasks = await Task.countDocuments({ assignedTo: userId }); // Fixed typo: 'assignedTo'

    // Count pending tasks assigned to this user
    const pendingTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'Pending'
    });

    // Count completed tasks assigned to this user
    const completedTasks = await Task.countDocuments({
      assignedTo: userId,
      status: 'Completed'
    });

    // Count overdue tasks (not completed and past due date)
    const overdueTasks = await Task.countDocuments({
      assignedTo: userId,
      status: { $ne: 'Completed' }, // Not completed
      dueDate: { $lt: new Date() }  // Due date before today
    });

    // 2. TASK DISTRIBUTION BY STATUS
    // All possible task statuses we want to track
    const taskStatuses = ['Pending', 'In Progress', 'Completed'];

    // Get raw count of tasks grouped by status
    const taskDistributionRaw = await Task.aggregate([
      { $match: { assignedTo: userId } }, // Only user's tasks
      { $group: { 
        _id: '$status',    // Group by status field (fixed: was string 'status')
        count: { $sum: 1 } // Count tasks in each group
      }}
    ]);

    // Transform data to include all statuses (even with 0 count)
    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for keys
      acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    // Add total count to distribution
    taskDistribution['All'] = totalTasks;

    // 3. TASK DISTRIBUTION BY PRIORITY
    // All possible priority levels
    const taskPriorities = ['Low', 'Medium', 'High'];

    // Get raw count of tasks grouped by priority
    const taskPriorityLevelsRaw = await Task.aggregate([
      { $match: { assignedTo: userId } }, // Only user's tasks
      { $group: { 
        _id: '$priority',  // Group by priority field (fixed: was string 'priority')
        count: { $sum: 1 } // Count tasks in each group
      }}
    ]);

    // Transform data to include all priorities (even with 0 count)
    const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
      acc[priority] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    // 4. RECENT TASKS
    // Get 10 most recent tasks for the user with selected fields
    const recentTasks = await Task.find({ assignedTo: userId })
      .sort({ createdAt: -1 })  // Newest first
      .limit(10)                // Only 10 tasks
      .select("title status priority dueDate createdAt"); // Specific fields

    // 5. RETURN COMPREHENSIVE RESPONSE
    res.status(200).json({
      statistics: {
        totalTasks,      // Total tasks assigned to user
        pendingTasks,    // Pending tasks count
        completedTasks,  // Completed tasks count
        overdueTasks     // Overdue tasks count
      },
      charts: {
        taskDistribution,   // Tasks grouped by status
        taskPriorityLevels  // Tasks grouped by priority
      },
      recentTasks  // List of recent tasks
    });

  } catch (error) {
    // 6. ERROR HANDLING
    console.error('User Dashboard Error:', error); // Log error for debugging
    res.status(500).json({
      message: "Server Error",  // Fixed typo: 'messaage'
      error: error.message     // Error details
    });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  updateTaskChecklist,
  getDashboardData,
  getUserDashboardData,
};
