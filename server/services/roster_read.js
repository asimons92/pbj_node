const csv = require("csv-parser");
const fs = require("fs");
const z = require('zod');
const { parseFullName } = require('../schemas/student.schema');


const results = [];

fs.createReadStream('p1roster.csv')
    .pipe(csv({ skipLines: 6 }))
    .on('data', (row) => {
        const { fullName, firstName, lastName} = parseFullName(row['First Middle Last']);
        const student = {
            fullName: fullName,
            firstName: firstName,
            lastName: lastName,
            studentID: row['Student ID'],
            Grade: row['Grade'],
            Gender: row['Gender']
        };
        results.push(student);
    })
    .on('end', () => {console.log(results);

    })


