const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { getDashboardData, getUserDashboardData, getTasks, getTaskById, createTask, updateTask, deleteTask, updateTaskStatus, updateTaskChecklist } = require('../controllers/taskController');

const router = express.Router();


//Task management route
router.get('/dashboard-data', protect, getDashboardData)
router.get('/user-dashboard-data', protect, getUserDashboardData);
router.get('/', protect, getTasks)//get all tasks admin and user assiggned
router.get('/:id', protect, getTaskById) //Get task by ID
router.post('/', protect, adminOnly, createTask)//create a task admin only
router.put('/:id', protect, updateTask)//update task details
router.delete('/:id', protect, adminOnly, deleteTask)//delete a task admin only.
router.put('/:id/status', protect, updateTaskStatus) //update task status.
router.put('/:id/todo', protect, updateTaskChecklist)//update task checklist.

module.exports = router;

