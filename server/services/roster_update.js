const mongoose = require('mongoose');
require('dotenv').config();  // defaults to ./.env from CWD

console.log('CWD:', process.cwd());
console.log('URI:', process.env.MONGODB_URI);

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(async () => {
  const result = await mongoose.connection.db.collection('students').updateMany(
    { createdBy: { $exists: false } },
    { $set: { createdBy: new mongoose.Types.ObjectId("69521f84612b190ba89d9b60") } }
  );
  console.log('Updated:', result.modifiedCount);
  await mongoose.connection.close();
});