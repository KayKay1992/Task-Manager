const express = require('express');
const { adminOnly, protect } = require('../middlewares/authMiddleware');
const { getUsers, getUserById } = require('../controllers/userController');

const router =express.Router();

//User Managment route;

//get all users (Admin Only)
router.get('/', protect, adminOnly, getUsers)

//Get a specific user
router.get('/:id', protect, getUserById)

//Delete a user (AdminOnly)
// router.delete('/:id', protect, adminOnly, deleteUser)

module.exports = router;