const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getUsers, login, register } = require('../controllers/auth.controller');
const { auth, requireAdmin } = require('../middleware/auth.middleware');

// Rate limiting for auth endpoints to prevent brute-force attacks
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window per IP
    message: { error: 'Too many attempts, please try again after 15 minutes' },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
});

// Separate limiter for registration (slightly more permissive)
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registration attempts per hour per IP
    message: { error: 'Too many registration attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Public routes (no auth required)

// login
router.post('/login', authLimiter, login);
// register
router.post('/register', registerLimiter, register);


// Protected routes (auth required)
router.use(auth);

// Admin-only routes
router.get('/users', requireAdmin, getUsers);


module.exports = router;
