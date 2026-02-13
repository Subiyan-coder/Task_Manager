const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Check if the user is logged in
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header (Looks like: "Bearer 12345token")
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');

      // Get user from the token, but don't include the password
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// 2. Check if the user is a Superior
const superiorOnly = (req, res, next) => {
  if (req.user && req.user.role === 'Superior') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Superiors only' });
  }
};

module.exports = { protect, superiorOnly };