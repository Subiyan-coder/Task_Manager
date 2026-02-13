const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Superior Only)
const createTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo } = req.body;

    const task = await Task.create({
      title,
      description,
      priority,
      assignedTo,
      createdBy: req.user.id, // We get this from the 'protect' middleware!
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private (Both Roles)
const getTasks = async (req, res) => {
  try {
    let tasks;
    
    if (req.user.role === 'Superior') {
      // Superiors see tasks they created
      tasks = await Task.find({ createdBy: req.user.id }).populate('assignedTo', 'name email');
    } else {
      // Team Members only see tasks assigned to them
      tasks = await Task.find({ assignedTo: req.user.id }).populate('createdBy', 'name email');
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private (Superior Only)
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Double-check that the superior updating the task is the one who created it
    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to edit this task' });
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Returns the updated document
    });

    res.status(200).json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Superior Only)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (task.createdBy.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }

    await task.deleteOne();

    res.status(200).json({ id: req.params.id, message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };