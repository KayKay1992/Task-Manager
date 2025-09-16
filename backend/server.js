require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const taskRoutes = require('./routes/taskRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Middleware to handle CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Specify frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect database
connectDB();

// Middleware
app.use(express.json());

// Root route for testing
app.get('/', (req, res) => {
  res.send('Task Manager Backend is running!');
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/reports', reportRoutes);

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 8000; // Align with Render's log
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});