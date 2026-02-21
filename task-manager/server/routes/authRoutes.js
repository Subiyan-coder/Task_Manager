const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, getAllUsers, deleteUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, getAllUsers); // <--- This creates /api/auth/users
router.delete('/users/:id', protect, deleteUser);

module.exports = router;