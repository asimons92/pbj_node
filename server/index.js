const express = require('express'); // handles routing
const mongoose = require('mongoose'); // handles MongoDB
const cors = require('cors'); // allows local dev back/front to talk to each other
const app = express(); // create app instance in express
const PORT = 3000; // set what port node runs on
require('dotenv').config(); // load environment variables

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pbj'; // get mongodb credentials or use local 

// try connecting to mongodb
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
  });

// middleware
// Enable CORS for all routes
app.use(cors());
// enables app to read JSON data sent in POST req body
app.use(express.json())


// Import route files
const notesRouter = require('./routes/notes.route');
const authRouter = require('./routes/auth.route');
const studentsRouter = require('./routes/students.route');


// Set up route paths
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.use('/api/students', studentsRouter);



// listener
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

