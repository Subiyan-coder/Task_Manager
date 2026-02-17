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

    // Check if a Pending task with this exact title already exists
    const existingTask = await Task.findOne({ title: title, status: 'Pending' });
    
    if (existingTask) {
      return res.status(400).json({ 
        message: 'A task with this title is already pending! Please use a different title or edit the existing one.' 
      });
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

// @desc    Update task (Superior: All fields | Member: Status only)
// @route   PUT /api/tasks/:id
// @access  Private

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // LOGIC: Who is trying to update?
    if (req.user.role === 'Superior') {
      // Superior can update EVERYTHING
      const updatedTask = await Task.findByIdAndUpdate(
        req.params.id,
        req.body,
        { returnDocument: 'after' }
      );
      return res.status(200).json(updatedTask);
    } 
    
    // If Team Member...
    // 1. Check if they are actually assigned to this task
    if (!task.assignedTo.includes(req.user.id)) {
      return res.status(401).json({ message: 'Not authorized to update this task' });
    }

    // 2. ONLY allow updating the 'status' field. Ignore title/description changes.
    if (req.body.status) {
      task.status = req.body.status;
      const updatedTask = await task.save();
      return res.status(200).json(updatedTask);
    } else {
        return res.status(400).json({ message: 'Team members can only update task status.' });
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task (Superior OR Creator)
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // CHECK: Is user a Superior OR did they create this task?
    // We use .toString() because task.createdBy is an Object, and req.user.id is a String
    if (req.user.role === 'Superior' || task.createdBy.toString() === req.user.id) {
      
      await Task.findByIdAndDelete(req.params.id);
      return res.status(200).json({ id: req.params.id });

    } else {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };