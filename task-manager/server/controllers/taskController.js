const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body; // assignedTo can now be an Array or Empty

    if (!title || !description) {
      return res.status(400).json({ message: 'Please add a title and description' });
    }

    // Logic: Who is this task for?
    let taskAssignments = [];

    if (req.user.role === 'Superior') {
      // If Superior, use the list they sent. If they sent nothing, default to empty.
      // We ensure it's an array even if they send just one ID string.
      taskAssignments = Array.isArray(assignedTo) ? assignedTo : (assignedTo ? [assignedTo] : []);
    } else {
      // If Team Member, FORCE assignment to themselves only.
      taskAssignments = [req.user.id];
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: taskAssignments, // Save the list
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get tasks
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    let tasks;

    if (req.user.role === 'Superior') {
      // Superior sees ALL tasks (and who they are assigned to)
      tasks = await Task.find()
        .populate('assignedTo', 'name email') // Show names, not just IDs
        .sort({ createdAt: -1 }); // Newest first
    } else {
      // Team Member sees only tasks assigned to them
      tasks = await Task.find({ assignedTo: { $in: [req.user.id] } })
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 });
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