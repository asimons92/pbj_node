const express = require('express');
const router = express.Router();
const { getUsers, login, register } = require('../controllers/auth.controller');
const { auth } = require('../middleware/auth.middleware');

// Public routes (no auth required)

// login
router.post('/login', login);
// register
router.post('/register', register);


// Protected routes (auth required)
router.use(auth);
router.get('/users', getUsers);


module.exports = router;
