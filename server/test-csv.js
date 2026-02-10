// test-csv.js (in server/ folder, delete later)
const parseStudentCSV = require('./services/csv.service');

parseStudentCSV('./services/p1roster.csv')
    .then(({ results, failed }) => {
        console.log('Valid students:', results.length);
        console.log('Failed rows:', failed.length);
        console.log('Sample:', results[0]);
        if (failed.length > 0) {
            console.log('First failure:', failed[0]);
            console.log('Zod errors:', failed[0].Error.issues);  // <-- the actual validation errors
        }
    })
    .catch((err) => {
        console.error('Error:', err);
    });