const express = require('express');
const router = express.Router();
const { testGet, postNote, getNotes, getNoteById, getMyNotes, deleteNote, editNote } = require('../controllers/notes.controller');
const { auth, requireAdmin } = require('../middleware/auth.middleware');



router.get('/',testGet);


// Protected routes (auth required)
router.use(auth);
router.post('/',postNote)
// IMPORTANT: More specific routes must come before parameterized routes
router.get('/my', getMyNotes)
router.get('/:id',getNoteById)
router.delete('/:id', deleteNote)
router.put('/:id',editNote);

// Admin only routes
// Not limited to users own notes
router.get('/', requireAdmin, getNotes);



module.exports = router;

