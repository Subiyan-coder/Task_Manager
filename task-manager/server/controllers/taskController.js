const Task = require('../models/Task');
const User = require('../models/User'); // Import User to check roles

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: 'Please add a title and description' });
    }

    // DUPLICATE CHECK
    const existingTask = await Task.findOne({ title: title, status: 'Pending' });
    if (existingTask) {
      return res.status(400).json({ message: 'A task with this title is already pending!' });
    }

    // Logic: Who is this task for?
    let taskAssignments = [];
    if (req.user.role === 'Superior') {
      // Superior can assign to list
      taskAssignments = Array.isArray(assignedTo) ? assignedTo : (assignedTo ? [assignedTo] : []);
    } else {
      // Team Member forces assignment to self
      taskAssignments = [req.user.id];
    }

    const task = await Task.create({
      title,
      description,
      assignedTo: taskAssignments,
      createdBy: req.user.id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get tasks (Filtered by Role Logic)
// @route   GET /api/tasks
// @access  Private

const getTasks = async (req, res) => {
  try {
    let tasks;

    // --- NEW: ADMIN OVERRIDE ---
    if (req.user.role === 'Admin') {
      // Admin sees absolutely everything in the database
      tasks = await Task.find({})
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name role')
        .sort({ createdAt: -1 });
    }

    else if (req.user.role === 'Superior') {
      // RULE: Superior sees (1) Their own tasks OR (2) Tasks created by Team Members (Self-assigned)
      // They do NOT see tasks created by other Superiors.
      
      // 1. Get IDs of all Team Members
      const members = await User.find({ role: 'Team Member' }).select('_id');
      const memberIds = members.map(m => m._id);

      tasks = await Task.find({
        $or: [
            { createdBy: req.user.id },       // Created by ME
            { createdBy: { $in: memberIds } } // Created by MEMBERS
        ]
      })
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name role') // <--- We need this for "Assigned By"
      .sort({ createdAt: -1 });

    } else {
      // Team Member: Sees tasks assigned to them
      tasks = await Task.find({ assignedTo: { $in: [req.user.id] } })
        .populate('assignedTo', 'name email')
        .populate('createdBy', 'name role') // <--- We need this for "Assigned By"
        .sort({ createdAt: -1 });
    }

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private

const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy'); // Need creator info

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // --- 🚨 ADD THIS: ADMIN GOD MODE OVERRIDE 🚨 ---
    if (req.user.role === 'Admin') {
      const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
      return res.status(200).json(updatedTask);
    }

    // Identify if the person making the request is the original creator
    const isCreator = task.createdBy._id.toString() === req.user.id;

    // --- SUPERIOR LOGIC ---
    if (req.user.role === 'Superior') {
        // Superior can edit if: They created it OR A member created it
        const isMemberTask = task.createdBy.role === 'Team Member';

        if (!isCreator && !isMemberTask) {
            return res.status(401).json({ message: 'Cannot edit tasks from other Superiors' });
        }
        
        // Allowed to update everything
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json(updatedTask);
    } 
    
    // --- TEAM MEMBER LOGIC ---
    // If they are not assigned to it AND they didn't create it, block them completely
    if (!task.assignedTo.includes(req.user.id) && !isCreator) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (isCreator) {
        // IF THE MEMBER CREATED IT: They get full rights to update title/description/status
        const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        return res.status(200).json(updatedTask);
    } else {
        // IF THE MEMBER DID NOT CREATE IT (Assigned by Superior): They can ONLY update status
        if (req.body.status) {
          task.status = req.body.status;
          const updatedTask = await task.save();
          return res.status(200).json(updatedTask);
        } else {
            return res.status(400).json({ message: 'Members can only update the status of tasks assigned to them.' });
        }
    }

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('createdBy');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // PERMISSION CHECK
    let allowed = false;
    
    // --- NEW: ADMIN OVERRIDE ---
    if (req.user.role === 'Admin') {
        allowed = true;
    } else if (req.user.role === 'Superior') {
        // Allow if MY task or MEMBER task
        if (task.createdBy._id.toString() === req.user.id || task.createdBy.role === 'Team Member') {
            allowed = true;
        }
    } else {
        // Allow if I created it (Self-assigned)
        if (task.createdBy._id.toString() === req.user.id) {
            allowed = true;
        }
    }

    if (allowed) {
      await Task.findByIdAndDelete(req.params.id);
      return res.status(200).json({ id: req.params.id });
    } else {
      return res.status(401).json({ message: 'Not authorized to delete this task' });
    }
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
};