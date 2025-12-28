// models/BehaviorRecord.js

const mongoose = require('mongoose');
const { Schema } = mongoose;



// Maps to the 'behavior' object
const BehaviorSchema = new Schema({
    category: {
        type: String,
        required: true,
        enum: [
            "off-task", "disruption", "non-participation", "tardy", "absence",
            "peer-disruption", "technology-violation", "prosocial", "defiance",
            "aggression", "self-management", "respect", "other"
        ]
    },
    description: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        required: true,
        enum: ["low", "moderate", "high"]
    },
    is_positive: {
        type: Boolean,
        required: true,
        default: false // Assuming most notes are not positive unless specified
    },
    needs_followup: {
        type: Boolean,
        required: true
    },
    tags: {
        type: [String], // Array of strings
        required: true
    }
}, { _id: false }); // Prevents Mongoose from auto-creating an ID for this sub-document

// Maps to the 'context' object
const ContextSchema = new Schema({
    class_name: String,
    teacher: String, // Link to a User object
    activity: String,
    group_ids: [String],
    location: String
}, { _id: false });

// Maps to the 'intervention' object
const InterventionSchema = new Schema({
    status: {
        type: String,
        enum: ["none", "recommended", "in_progress", "completed"]
    },
    type: String,
    notes: String,
    tier: {
        type: String,
        enum: ["universal", "tier_1", "tier_2", "tier_3"]
    }
}, { _id: false });


// --- 2. Define the Main Behavior Record Schema ---

const BehaviorRecordSchema = new Schema({
    // Store the original note for auditing/LLM re-parsing
    originalText: {
        type: String,
        required: true
    },

    // Fields directly from the LLM output's top level
    student_name: {
        type: String,
        required: true,
        index: true // Good for querying/analytics
    },
    student_id: String,
    recording_timestamp: {
        type: Date,
        required: true,
        default: Date.now // Use a Date type, often populated by the backend if not provided
    },
    behavior_date: Date, // LLM may parse this from notes, or we may use the timestamp
    source: {
        type: String,
        required: true,
        enum: ["teacher_note"],
        default: "teacher_note"
    },
    
    // Nested Schemas using the definitions above
    behavior: {
        type: BehaviorSchema,
        required: true
    },
    context: ContextSchema, // Optional, so no 'required: true'
    intervention: InterventionSchema, // Optional
    
    // Metadata maintained by the backend
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Export the Model, using 'BehaviorRecord' as the collection name
module.exports = mongoose.models.BehaviorRecord || mongoose.model('BehaviorRecord', BehaviorRecordSchema);

