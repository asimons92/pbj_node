const express = require('express');
const router = express.Router();
const { getAllStudents, uploadStudents } = require('../controllers/students.controller')
const { auth, requireAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const upload = multer({ dest: 'uploads/'});

router.use(auth);
router.get('/my',getAllStudents);
//router.get('/:id');
router.post('/upload',upload.single('roster'),uploadStudents);
//router.put('/:id');
//router.delete('/:id');


module.exports = router;