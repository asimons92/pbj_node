const express = require('express');
const router = express.Router();
const { testGet, postNote, getNotes } = require('../controllers/notes.controller');

router.get('/',testGet);

router.get('/records',getNotes);

router.post('/records',postNote);

module.exports = router;

