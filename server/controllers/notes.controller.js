// Import LLM service (matches `services/llm_service.js`)
const { callLlmApi } = require('../services/llm_service');
// Import BehaviorRecord model
const BehaviorRecord = require('../models/BehaviorRecord.model');
const mongoose = require('mongoose');

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
        // Generate the recording timestamp (when the note is being processed/recorded)
        const recordingTimestamp = new Date();
        // We need to wait for the structured data from the service
        // llmData should be an array of record objects, see llm_service.js
        const llmData = await callLlmApi(originalText, recordingTimestamp); 
        // if there's nothing in the response, throw a 400 error
        if (!llmData.records) {
            return res.status(400).json({ error: 'Empty array in res body'})
        }
        // set up the records for database storage
        const recordsToSave = llmData.records.map(record => ({
            originalText: originalText, // must keep original text for continuity and quality control
            ...record,               // unpack the record into individual fields
            source: "teacher_note",   // the source from this path will always be an original teacher note
                                     // it could be "migration" or something in the future
            createdBy: new mongoose.Types.ObjectId(req.user.id)      // save who made the note (convert string to ObjectId)
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
        // Debug: log admin query
        console.log('getNotes (admin) - Querying all records, page:', page);
        
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

        // Debug: log what was found
        console.log('getNotes (admin) - Found', records.length, 'records out of', totalCount, 'total');
        if (records.length > 0) {
            console.log('Sample record createdBy:', records[0].createdBy);
        }

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

const getNoteById = async (req,res) => {
    try {
        const recordId = req.params.id;
        console.log('Got recordId from req.params ' ,{recordId})
        // Build query with permission check to prevent information disclosure
        // Admins can see any record, users can only see their own
        const query = { _id: recordId };
        console.log('Building query object with recordId',{query})
        if (req.user.role !== 'admin') {
            query.createdBy = new mongoose.Types.ObjectId(req.user.id);
            console.log('If not admin block hit')
        }
        
        const record = await BehaviorRecord.findOne(query);
        console.log('record value is ',{record}) // this is coming back null for an unauthorized user
        // If record not found, it could be:
        // 1. Record doesn't exist
        // 2. Record exists but user doesn't have permission
        // Return 404 for both to prevent enumeration attacks
        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        res.status(200).json({
            record: record
        });
    } catch (error) {
        console.error('Get note by ID error:', error.message);
        res.status(500).json({ error: 'Failed to retrieve record.', detail: error.message });
    }
}
const getMyNotes = async (req,res) => {
    const getAll = req.query.all === 'true';  // Check if client wants all records (for dashboards/analytics)
    const page = parseInt(req.query.page) || 1;     // parseInt turns str -> int. Req query will contain what page or default to 1
    const limit = parseInt(req.query.limit) || 10;  // how many per page, default 10
    const skip = (page-1) * limit;                  // how many records to skip based on page and limit

    try {
        // Debug: log the user making the request
        console.log('getMyNotes - User ID:', req.user.id, 'Role:', req.user.role, 'Get All:', getAll);
        
        const { student_name, category, severity } = req.query; // these values are from the req query. depends on frontend
        const filter = {
            createdBy: new mongoose.Types.ObjectId(req.user.id)
        }; 
        if (student_name) {
            filter.student_name = { $regex: student_name, $options: 'i'};   // mongoose regex to find matches, case insensitive
        }
        if (category) {
            filter['behavior.category'] = category;  // add a category if there is one
        }
        if (severity) {
            filter['behavior.severity'] = severity; // add a severity if there is one
        }
        
        // If getAll is true, return all records without pagination (for dashboards/analytics)
        if (getAll) {
            const records = await BehaviorRecord.find(filter)
                .sort({ recording_timestamp: -1 })
                .exec();
            
            res.status(200).json({
                records: records,
                totalCount: records.length
            });
        } else {
            // Paginated response
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
        }
    } catch (error) {
        console.error('Database retrieval error:',error.message);
        res.status(500).json({ error: 'Failed to retrieve behavior records.', detail: error.message });

    }
   


}

const deleteNote = async (req,res) => {
    try {
        const recordId = req.params.id;
        
        // Build query with permission check to prevent information disclosure
        // Admins can delete any record, users can only delete their own
        const query = { _id: recordId };
        if (req.user.role !== 'admin') {
            query.createdBy = new mongoose.Types.ObjectId(req.user.id);
        }
        
        const record = await BehaviorRecord.findOne(query);
        
        // If record not found, it could be:
        // 1. Record doesn't exist
        // 2. Record exists but user doesn't have permission
        // Return 404 for both to prevent enumeration attacks
        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        await BehaviorRecord.findByIdAndDelete(recordId);
        res.status(200).json({ message: 'Record deleted successfully' });
    } catch (error) {
        console.error('Delete record error:', error.message);
        res.status(500).json({ error: 'Failed to delete record.', detail: error.message });
    }
}

const editNote = async (req,res) => {
    try {
        const recordId = req.params.id;
        
        // Build query with permission check to prevent information disclosure
        // Admins can update any record, users can only update their own
        const query = { _id: recordId };
        if (req.user.role !== 'admin') {
            query.createdBy = new mongoose.Types.ObjectId(req.user.id);
        }
        
        const record = await BehaviorRecord.findOne(query);
        
        // If record not found, it could be:
        // 1. Record doesn't exist
        // 2. Record exists but user doesn't have permission
        // Return 404 for both to prevent enumeration attacks
        if (!record) {
            return res.status(404).json({ error: 'Record not found' });
        }
        
        // Filter out protected fields that shouldn't be updated
        const { createdBy, _id, originalText, source, createdAt, ...updateData } = req.body;
        
        // Update the record and return the updated document
        const updatedRecord = await BehaviorRecord.findByIdAndUpdate(
            recordId,
            updateData,
            { new: true, runValidators: true } // Return updated doc and run schema validators
        );
        return res.status(200).json(updatedRecord);
    } catch (error) {
        console.error('Edit record error:', error.message);
        return res.status(500).json({ error: 'Failed to update record.', detail: error.message });
    }
}

module.exports = {
    testGet,
    postNote,
    getNotes,
    getMyNotes,
    deleteNote,
    editNote,
    getNoteById
    

}




