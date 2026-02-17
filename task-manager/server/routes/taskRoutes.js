const express = require('express');
const router = express.Router();
const { createTask, getTasks, updateTask, deleteTask } = require('../controllers/taskController');
const { protect, superiorOnly } = require('../middleware/authMiddleware');

// 1. GET TASKS: Open to everyone (Controller filters what they see)
router.get('/', protect, getTasks);

// 2. CREATE TASK: Open to everyone (Controller forces Arun to assign to self)
router.post('/', protect, createTask);

// 3. UPDATE TASK: Open to everyone (We will fix the logic next so Arun can only update status)
router.put('/:id', protect, updateTask);

// 4. DELETE TASK: STRICTLY Superior Only (Arun cannot delete)
router.delete('/:id', protect,  deleteTask);

module.exports = router;