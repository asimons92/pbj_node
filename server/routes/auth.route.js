const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/auth.controller');

// Auth routes
router.get('/users', getUsers);


// login

// register


module.exports = router;
