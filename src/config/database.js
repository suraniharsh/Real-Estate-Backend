const mongoose = require("mongoose");
const { logger } = require("../utils/logger");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/Real_Estate", {
      useNewUrlParser: true,   // Correct way to pass options
      useUnifiedTopology: true // Correct way to pass options
    });

    logger.info("✅ MongoDB connected successfully!");
  } catch (error) {
    logger.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit process if DB connection fails
  }
};

module.exports = { connectDB };
