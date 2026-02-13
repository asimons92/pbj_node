const express = require('express');
const router = express.Router();
const { getAllStudents, uploadStudents } = require('../controllers/students.controller')
const { auth, requireAdmin } = require('../middleware/auth.middleware');
const multer = require('multer');
const upload = multer({
     dest: 'uploads/',
     fileFilter: (req,file,cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')){
            cb(null,true);
        } else {
            cb(new Error('Only CSV files allowed'), false);
        }
     }
    });

router.use(auth);
router.get('/my',getAllStudents);
//router.get('/:id');
router.post('/upload',upload.single('roster'),uploadStudents);
//router.put('/:id');
//router.delete('/:id');


module.exports = router;