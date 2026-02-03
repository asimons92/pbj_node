const z = require('zod');

const StudentBaseSchema = z.object({
    fullName: z.string().min(1),              // Source of truth - original from roster
    firstName: z.string().min(1),             // Parsed: first token
    lastName: z.string().min(1),              // Parsed: last token
    nickName: z.string().min(1).optional(),
    studentId: z.number().int().gte(1000000).lte(9999999),
    grade: z.number().int().min(9).max(12).optional(),
    gender: z.enum(['Male', 'Female', '']).optional(),  // Some rows have empty gender
    teacherId: z.string()
    // connect to class object later. Not for MVP
});

// Helper to parse a full name string into components
function parseFullName(fullName) {
    const tokens = fullName.trim().split(/\s+/);
    if (tokens.length === 1) {
        return { fullName, firstName: tokens[0], lastName: tokens[0] };
    }
    return {
        fullName,
        firstName: tokens[0],
        lastName: tokens[tokens.length - 1]
    };
}

module.exports = {
    StudentBaseSchema,
    parseFullName
}