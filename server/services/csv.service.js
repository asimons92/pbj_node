const csv = require("csv-parser");
const fs = require("fs");
const z = require('zod');
const { parseFullName, StudentBaseSchema } = require('../schemas/student.schema');


// Input: path to uploaded CSV file (from multer middleware)
// Output: [results],[failed]

function parseStudentCSV(filePath) {
    const results = [];
    const failed = [];
    return new Promise((resolve,reject) => {
        fs.createReadStream(filePath)
        .pipe(csv({ skipLines: 6}))
        .on('data', (row) => {
            const { fullName, firstName, lastName} = parseFullName(row['First Middle Last']);
            const student = {
                fullName: fullName,
                firstName: firstName,
                lastName: lastName,
                studentId: parseInt(row['Student ID']),
                grade: parseInt(row['Grade']),
                gender: row['Gender']
            };
            const result = StudentBaseSchema.safeParse(student);
            if (result.success) {
                const validatedStudent = result.data;
                results.push(validatedStudent);
            } else {
                const failedStudent = {Student: result.data, Error: result.error}
                failed.push(failedStudent);
            }
            
        })
        .on('end', () => {
            // done
            
        })
        .on('error', (err) => {
            // error
        })
    })
}

module.exports = parseStudentCSV;