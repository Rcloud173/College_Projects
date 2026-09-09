const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error("MONGO_URI is missing in .env");
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log("MongoDB connected:", mongoose.connection.name);
  } catch (error) {
    console.error("MongoDB not connected:", error.message);
    console.error("Check MONGO_URI in backend/.env");
  }
}

module.exports = connectDB;
