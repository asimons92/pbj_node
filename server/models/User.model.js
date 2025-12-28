const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'teacher'],
        default: 'teacher',
        required: true
    },
    // Placeholder for future organization support
    // Can be refactored to ObjectId ref when Organization model is created
    organization: {
        type: String,
        required: false,
        index: true // Added for future querying efficiency
    }
}, 
    { timestamps: true }
)

module.exports = mongoose.models.User || mongoose.model('User', UserSchema);
