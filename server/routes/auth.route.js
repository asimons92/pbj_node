const express = require('express');
const router = express.Router();
const { getUsers, login, register } = require('../controllers/auth.controller');
const { auth, requireAdmin } = require('../middleware/auth.middleware');

// Public routes (no auth required)

// login
router.post('/login', login);
// register
router.post('/register', register);


// Protected routes (auth required)
router.use(auth);

// Admin-only routes
router.get('/users', requireAdmin, getUsers);


module.exports = router;
