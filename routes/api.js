const express = require('express');
const router = express.Router();

// Import LLM service (matches `services/llm_service.js`)
const { callLlmApi } = require('../services/llm_service');
// Import BehaviorRecord model
const BehaviorRecord = require('../models/BehaviorRecord');


// Define GET route (Keep this at the bottom or top, doesn't affect flow)
router.get('/', (req, res) => {
    res.json({ 
        status: 'API operational',
        message: 'Send a POST request to /api/notes/parse to submit teacher notes.'
    });
});

router.post('/notes/parse', async (req, res) => {
    const originalText = req.body.teacherNotes; // Renamed 'notes' to 'originalText' for clarity

    if (!originalText) {
        return res.status(400).json({ error: 'Missing teacherNotes in request body.'});
    }

    try {

        // 1. --- CALL THE LLM SERVICE FIRST ---
        console.log('Calling LLM API for notes.');
        // We need to wait for the structured data from the service
        const llmData = await callLlmApi(originalText); 

        if (!llmData.records) {
            return res.status(400).json({ error: 'Empty array in res body'})
        };

        const recordsToSave = llmData.records.map(record => ({
            originalText: originalText,
            source: "teacher_note",
            ...record
        }));

        // 3. --- SAVE THE RECORD TO THE DATABASE ---
        try {
            const savedRecords = await BehaviorRecord.insertMany(
                recordsToSave,
                { ordered: false } // allow partial successes
            );
            
            console.log(`Successfully saved records.`);
            
            // 4. --- SEND THE SUCCESSFUL RESPONSE ---
            // console.log(savedRecords)
            res.status(201).json(savedRecords);

        } catch (error) {
            if (error.writeErrors) {
                const successful = error.insertedDocs || [];
                const failed = error.writeErrors.map(err => ({
                    index: err.index,
                    error: err.errmsg
                }));
            } else {
                throw error;
            }

        }

        
    } catch (error) {
        // Ensure error logging is robust
        console.error('LLM API or Database Error:', error.message);
        res.status(500).json({ error: 'Failed to process or save notes.', detail: error.message});
    }
});

router.get('/records', async (req,res) => {
    try {
        const { student_name, category, severity } = req.query;
        const filter = {};
        if (student_name) {
            filter.student_name = { $regex: student_name, $options: 'i'};

        }
        if (category) {
            filter['behavior.category'] = category;
        }
        if (severity) {
            filter['behavior.severity'] = severity;
        }

        const records = await BehaviorRecord.find(filter).sort({ recording_timestamp: -1});
        res.status(200).json(records);
    } catch (error) {
        console.error('Database retrieval error:',error.message);
        res.status(500).json({ error: 'Failed to retrieve behavior records.', detail: error.message });

    }
   
})

module.exports = router;