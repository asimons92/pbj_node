const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = 3000;
require('dotenv').config(); // load environment variables

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pbj';

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
  });

// middleware
// enables app to read JSON data sent in POST req body
app.use(express.json())


// Import route files
const apiRouter = require('./routes/notes.route');
const authRouter = require('./routes/auth.route');

// Set up route paths
app.use('/api', apiRouter);
app.use('/auth', authRouter);

// listener
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

