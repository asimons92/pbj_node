const express = require('express');
const router = express.Router();
const { testGet, postNote, getNotes, getNoteById, getMyNotes, deleteNote, editNote } = require('../controllers/notes.controller');
const { auth, requireAdmin } = require('../middleware/auth.middleware');



router.get('/',testGet);


// Protected routes (auth required)
router.use(auth);
router.post('/records',postNote)
// IMPORTANT: More specific routes must come before parameterized routes
router.get('/records/my', getMyNotes)
router.get('/records/:id',getNoteById)
router.delete('/records/:id', deleteNote)
router.put('/records/:id',editNote);

// Admin only routes
// Not limited to users own notes
router.get('/records', requireAdmin, getNotes);



module.exports = router;

