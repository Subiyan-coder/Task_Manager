const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Helper function to generate a JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecretkey123', {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // --- 🚨 DEBUGGING LOGS (Delete these later!) ---
    console.log("Email from frontend:", email);
    console.log("Email from .env file:", process.env.ADMIN_EMAIL);
    
    // --- 🚨 THE SECRET ADMIN BYPASS 🚨 ---
    // Default to whatever they selected, but override if it's your secret email
    let finalRole = role || 'Team Member';
    if (email === process.env.ADMIN_EMAIL) { // <-- CHANGE THIS TO YOUR EMAIL
      finalRole = 'Admin';
    }

    // 1. Check if the user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create the user in the database
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole, // <-- NOW USING THE OVERRIDE VARIABLE
    });

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // This will automatically send back 'Admin' to your frontend
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Authenticate a user (Login)
// @route   POST /api/auth/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user by email
    const user = await User.findOne({ email });

    // 2. Check if user exists and password matches
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user data
// @route   GET /api/auth/me
// @access  Private

const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

// @desc    Get users (Filtered by Role)
// @route   GET /api/auth/users
// @access  Private (Superior & Admin)

const getAllUsers = async (req, res) => {
  try {
    let users;

    if (req.user.role === 'Admin') {
      // 🚨 ADMIN OVERRIDE: Fetch absolutely everyone (except passwords)
      users = await User.find({}).select('-password');
    } else {
      // SUPERIOR: Only fetch 'Team Member' roles. 
      users = await User.find({ role: 'Team Member' }).select('-password');
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private (Admin Only)
const deleteUser = async (req, res) => {
  try {
    // SECURITY CHECK: Only Admins can do this
    if (req.user.role !== 'Admin') {
      return res.status(401).json({ message: 'Not authorized. Admins only.' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ id: req.params.id });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, loginUser, getMe, getAllUsers, deleteUser };