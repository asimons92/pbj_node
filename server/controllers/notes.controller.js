// Import LLM service (matches `services/llm_service.js`)
const { callLlmApi } = require('../services/llm_service');
// Import BehaviorRecord model
const BehaviorRecord = require('../models/BehaviorRecord.model');

// test controller logic to check auth in postman
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
    // Contract: body of request must have teacherNotes
    const originalText = req.body.teacherNotes; 

    if (!originalText) {
        return res.status(400).json({ error: 'Missing teacherNotes in request body.'});
    }
    // try block
    try {

        //  --- CALL THE LLM SERVICE FIRST ---
        console.log('Calling LLM API for notes.');
        // We need to wait for the structured data from the service
        // llmData should be an array of record objects, see llm_service.js
        const llmData = await callLlmApi(originalText); 
        // if there's nothing in the response, throw a 400 error
        if (!llmData.records) {
            return res.status(400).json({ error: 'Empty array in res body'})
        }
        // set up the records for database storage
        const recordsToSave = llmData.records.map(record => ({
            originalText: originalText, // must keep original text for continuity and quality control
            ...record,               // unpack the record into individual fields
            source: "teacher_note"   // the source from this path will always be an original teacher note
                                     // it could be "migration" or something in the future
        }));

        //  --- SAVE THE RECORD TO THE DATABASE ---
        try {
            const savedRecords = await BehaviorRecord.insertMany(
                recordsToSave,
                { ordered: false } // allow partial successes
                                   // this is important later for error handling 
            );
            
            console.log(`Successfully saved records.`);
            
            //  --- SEND THE SUCCESSFUL RESPONSE ---
            // console.log(savedRecords)
            res.status(201).json(savedRecords); // sends a succesful response to the client with 
                                                // the saved records as JSON

        } catch (error) {
            if (error.writeErrors) {
                // conditional error handling because insertMany was set to allow partial success
                const successful = error.insertedDocs || [];
                const failed = error.writeErrors.map(err => ({
                    index: err.index,
                    error: err.errmsg
                }));
                
                // Check if this is partial success (some succeeded) or complete failure (all failed)
                if (successful.length > 0) {
                    // Partial success - some succeeded, some failed
                    res.status(207).json({ // this status code signals partial success
                        successful,
                        failed,
                        message: `Partially saved: ${successful.length} succeeded, ${failed.length} failed `
                    });
                } else {
                    // All documents failed - return 400 Bad Request
                    res.status(400).json({
                        error: 'All records failed to save',
                        failed,
                        message: `Failed to save all ${failed.length} records`
                    });
                }
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

// get notes from the db with pagination logic
const getNotes = async (req,res) => {
    const page = parseInt(req.query.page) || 1;     // parseInt turns str -> int. Req query will contain what page or default to 1
    const limit = parseInt(req.query.limit) || 10;  // how many per page, default 10
    const skip = (page-1) * limit;                  // how many records to skip based on page and limit

    try {
        const { student_name, category, severity } = req.query; // these values are from the req query. depends on frontend
        const filter = {}; // empty object to build filter object out of
        if (student_name) {
            filter.student_name = { $regex: student_name, $options: 'i'};   // mongoose regex to find matches, case insensitive
        }
        if (category) {
            filter['behavior.category'] = category;  // add a category if there is one
        }
        if (severity) {
            filter['behavior.severity'] = severity; // add a severity if there is one
        }
        const [records, totalCount] = await Promise.all([                   // promise the records, and how many
            BehaviorRecord.find(filter).sort({ recording_timestamp: -1})    // find them based on filter object made above
            .skip(skip)                                                     // sort by descending timestamp 
            .limit(limit),
            BehaviorRecord.countDocuments(filter)                           // how many returned
        ]);

        const totalPages = Math.ceil(totalCount / limit);                   // how many pages
        const hasNextPage = page < totalPages;                              // booleans say if we display buttons or not
        const hasPrevPage = page > 1;

        res.status(200).json({              // response JSON, good 200, pagination data
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




