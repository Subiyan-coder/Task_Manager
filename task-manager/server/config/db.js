const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // This connects to the URI in your .env file
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1); // Shuts down the server if the database fails to connect
  }
};

module.exports = connectDB;