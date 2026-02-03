const csv = require("csv-parser");
const fs = require("fs");
const z = require('zod');
const results = [];

fs.createReadStream('p1roster.csv')
    .pipe(csv({ skipLines: 6}))
    .on('data', (data) => results.push(data))
    .on('end', () => {console.log(results);

    })