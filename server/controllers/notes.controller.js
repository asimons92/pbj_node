// Import LLM service (matches `services/llm_service.js`)
const { callLlmApi } = require('../services/llm_service');
// Import BehaviorRecord model
const BehaviorRecord = require('../models/BehaviorRecord.model');


const testGet = async (req,res) => {
    try {
        res.json({
        status: 'API operational',
        message: 'Send a POST request to /api/records/parse to submit teacher notes.'
        })
    } catch (error) {
        res.status(500).json({ error: error.message || 'An error occurred' });
    }
};

// post new record

const postNote = async (req, res) => {
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
        }

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
                res.status(207).json({
                    successful,
                    failed,
                    message: `Partially saved: ${successful.length} succeeded, ${failed.length} failed `
                })
            } else {
                throw error;
            }

        }

        
    } catch (error) {
        // Ensure error logging is robust
        console.error('LLM API or Database Error:', error.message);
        res.status(500).json({ error: 'Failed to process or save notes.', detail: error.message});
    }
};

const getNotes = async (req,res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page-1) * limit;

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
        const [records, totalCount] = await Promise.all([
            BehaviorRecord.find(filter).sort({ recording_timestamp: -1})
            .skip(skip)
            .limit(limit),
            BehaviorRecord.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        res.status(200).json({
            records: records,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalCount: totalCount,
                limit: limit,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage
            }
        });
    } catch (error) {
        console.error('Database retrieval error:',error.message);
        res.status(500).json({ error: 'Failed to retrieve behavior records.', detail: error.message });

    }
   
}

module.exports = {
    testGet,
    postNote,
    getNotes
    

}




