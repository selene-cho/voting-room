const mongoose = require("mongoose");

async function connectMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Successfully connected MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  }
}

module.exports = connectMongoDB;
