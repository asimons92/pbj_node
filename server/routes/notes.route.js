const express = require('express');
const router = express.Router();
const { testGet, postNote, getNotes } = require('../controllers/notes.controller');
const { auth } = require('../middleware/auth.middleware');



router.get('/',testGet);


// Protected routes (auth required)
router.use(auth);

router.get('/records',getNotes);

router.post('/records',postNote);

module.exports = router;

