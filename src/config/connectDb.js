const mongoose = require('mongoose');
const dev = require('.');

const connectDb = async () => {
  try {
    await mongoose.connect(dev.databaseUrl);
    console.log("Successfully connected to database!");
  } catch (error) {
    console.log(`Could not connected to database: ${error.message}`);
  }
}

module.exports = connectDb;