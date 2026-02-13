const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load the secret variables
dotenv.config();

const connectDB = require('./config/db');

// Connect to the database
connectDB();

// Initialize the Express app
const app = express();

// Middleware (Allows your frontend to talk to your backend safely)
app.use(cors());
app.use(express.json());

// A simple test route
app.get('/', (req, res) => {
  res.send('Task Management API is running!');
});

// Define the port and start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});