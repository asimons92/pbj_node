const mongoose = require('mongoose');
const { Schema } = mongoose;

// Mirrors StudentBaseSchema from schemas/student.schema.js
const StudentSchema = new Schema({
    fullName: {
        type: String,
        required: true,
        minlength: 1
    },
    firstName: {
        type: String,
        required: true,
        minlength: 1
    },
    lastName: {
        type: String,
        required: true,
        minlength: 1,
        index: true  // Good for searching by last name
    },
    nickName: {
        type: String,
        minLength: 1
    },
    studentId: {
        type: Number,
        required: true,
        unique: true,
        min: 1000000,
        max: 9999999
    },
    grade: {
        type: Number,
        min: 9,
        max: 12
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', '']
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
        index: true
    }
}, { timestamps: true });

module.exports = mongoose.models.Student || mongoose.model('Student', StudentSchema);

