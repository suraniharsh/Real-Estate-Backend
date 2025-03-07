const mongoose = require("mongoose");
const { logger } = require("../utils/logger");
require("dotenv").config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger.info("MongoDB connected");
  } catch (error) {
    logger.error("MongoDB connection error:", error);
    process.exit(1); // Exit process if DB connection fails
  }
};

module.exports = { connectDB };
