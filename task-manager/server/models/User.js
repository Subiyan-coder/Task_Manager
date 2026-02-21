const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // No duplicate accounts allowed
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['Superior', 'Team Member', 'Admin'], // These are the only two valid roles and the admin is hidden behind the scenes
      default: 'Team Member',
    },
  },
  {
    timestamps: true, // Automatically adds a createdAt and updatedAt date
  }
);

module.exports = mongoose.model('User', userSchema);