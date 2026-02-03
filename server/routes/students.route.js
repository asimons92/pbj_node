const express = require('express');
const router = express.Router();
const { getAllStudents } = require('../controllers/students.controller')
const { auth, requireAdmin } = require('../middleware/auth.middleware');

router.use(auth);
router.get('/my',getAllStudents);
//router.get('/:id');
//router.post('/');
//router.post('/my')
//router.put('/:id');
//router.delete('/:id');


module.exports = router;