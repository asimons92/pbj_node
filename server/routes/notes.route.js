const express = require('express');
const router = express.Router();
const { testGet, postNote, getNotes, getMyNotes } = require('../controllers/notes.controller');
const { auth, requireAdmin } = require('../middleware/auth.middleware');



router.get('/',testGet);


// Protected routes (auth required)
router.use(auth);
router.post('/records',postNote);
router.get('/records/my',getMyNotes)
// need a get route for only a users own notes

// Admin only routes
// Not limited to users own notes
router.get('/records',requireAdmin, getNotes);



module.exports = router;

