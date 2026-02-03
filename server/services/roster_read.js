const csv = require("csv-parser");
const fs = require("fs");
const z = require('zod');
const Student = require('../models/Student.model');
const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' });
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pbj';


const { parseFullName, StudentBaseSchema } = require('../schemas/student.schema');

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
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
        .on('end', async () => {
            const operations = results.map(student => ({
                updateOne: {
                    filter: { studentId: student.studentId},
                    update: { $set: student},
                    upsert: true
                }
    
            }));

            const result = await Student.bulkWrite(operations);
            console.log('Bulk write complete:', result);
            console.log(`Inserted/updated ${operations.length} students`);
    
            await mongoose.connection.close();
            console.log('Connection closed');

        })
    
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
  });



