const express = require('express');
const router = express.Router();
const { testGet, postNote, getNotes, getMyNotes, deleteNote } = require('../controllers/notes.controller');
const { auth, requireAdmin } = require('../middleware/auth.middleware');



router.get('/',testGet);


// Protected routes (auth required)
router.use(auth);
router.get('/records/my', getMyNotes);
router.delete('/records/:id', deleteNote);

// Admin only routes
// Not limited to users own notes
router.get('/records', requireAdmin, getNotes);



module.exports = router;

