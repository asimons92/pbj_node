const express = require('express');
const router = express.Router();
const { auth, requireAdmin } = require('../middleware/auth.middleware');

router.use(auth);
router.get('/api/students');
router.get('/api/students/:id');
router.post('/api/students');
router.post('/api/students/my')
router.put('/api/students/:id');
router.delete('/api/students/:id');