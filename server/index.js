const express = require('express'); // handles routing
const mongoose = require('mongoose'); // handles MongoDB
const cors = require('cors'); // allows local dev back/front to talk to each other
const app = express(); // create app instance in express
const PORT = process.env.PORT || 3000;
require('dotenv').config(); // load environment variables
const logger = require('./utils/logger');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pbj'; // get mongodb credentials or use local 

// try connecting to mongodb
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
  })
  .catch((err) => {
    logger.error('Failed to connect to MongoDB:', err.message);
  });

// middleware
// Configure CORS - restrict to allowed origins in production
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.) in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
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
app.use((err, req, res, next) => {
  logger.error('Error:', err.message);
  res.status(err.status || 500).json({ error: err.message});
});



// listener
app.listen(PORT, () => {
  logger.info(`Server is running on http://localhost:${PORT}`);
});

