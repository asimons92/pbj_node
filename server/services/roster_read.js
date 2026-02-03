const csv = require("csv-parser");
const fs = require("fs");
const z = require('zod');
const { parseFullName, StudentBaseSchema } = require('../schemas/student.schema');


const results = [];
const failed = [];

fs.createReadStream('p1roster.csv')
    .pipe(csv({ skipLines: 6 }))
    .on('data', (row) => {
        const { fullName, firstName, lastName} = parseFullName(row['First Middle Last']);
        const student = {
            fullName: fullName,
            firstName: firstName,
            lastName: lastName,
            studentId: parseInt(row['Student ID']),
            Grade: row['Grade'],
            Gender: row['Gender']
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
        console.log(results);
        console.log(failed);

    })


