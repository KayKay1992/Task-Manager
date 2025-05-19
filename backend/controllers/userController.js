const Task = require("../models/Task");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

//@desc  Get All Users (adminOnly)
//@route Get /api/users/
//@access admin only
const getUsers = async (req, res, next) => {
  // Make sure to include 'res' parameter
  try {
    const users = await User.find({ role: "member" }).select("-password");

    // Add task counts to each user
    const usersWithTaskCounts = await Promise.all(
      users.map(async (user) => {
        const pendingTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Pending",
        });
        const inProgressTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "In Progress",
        });
        const completedTasks = await Task.countDocuments({
          assignedTo: user._id,
          status: "Completed",
        });

        return {
          ...user._doc, // includes all existing user data
          pendingTasks,
          inProgressTasks,
          completedTasks,
        };
      })
    );

    // Make sure to use 'res' (response object) here
    res.json(usersWithTaskCounts);
  } catch (error) {
    // Either use next(error) or res.status().json()
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};
//@desc  Get user by id
//@route Get /api/users/:id
//@access private
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "user not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({
      message: "server error",
      error: error.message,
    });
  }
};

//Not needed
//@desc  Delete a user
//@route Delete /api/users/:id
//@access admin
// const deleteUser = async (req, res) => {
//   try {
//   } catch (error) {
//     res.status(500).json({
//       message: "server error",
//       error: error.message,
//     });
//   }
// };

module.exports = { getUsers, getUserById };
