const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load the secret variables
dotenv.config();

// Connect to the database
connectDB();

// Initialize the Express app
const app = express();

app.use(cors()); 
app.use(express.json());

// Middleware (Allows your frontend to talk to your backend safely)
app.use(cors());
app.use(express.json());

// --- KEEP ALIVE PING ROUTE ---
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'Server is awake!' });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));

app.use('/api/tasks', require('./routes/taskRoutes'));

// A simple test route
app.get('/', (req, res) => {
  res.send('Task Management API is running!');
});

// Define the port and start listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is up and running on port ${PORT}`);
});