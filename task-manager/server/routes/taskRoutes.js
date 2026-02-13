const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, superiorOnly } = require('../middleware/authMiddleware');

// Route for getting tasks
router.get('/', protect, getTasks);

// Route for creating a task
router.post('/', protect, superiorOnly, createTask);

// Route for updating a task (Requires the task ID in the URL)
router.put('/:id', protect, superiorOnly, updateTask);

// Route for deleting a task (Requires the task ID in the URL)
router.delete('/:id', protect, superiorOnly, deleteTask);

module.exports = router;