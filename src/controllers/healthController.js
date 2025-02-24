const mongoose = require("mongoose");
const redisClient = require("../config/redis");
const { formatSuccessResponse } = require("../utils/response");
const { logger } = require("../utils/logger");

const checkHealth = async (req, res, next) => {
  try {
    const serverStatus = {
      status: "healthy",
      uptime: process.uptime().toFixed(2), // Round uptime for readability
    };

    const mongoStatus = {
      status: mongoose.connection.readyState === 1 ? "healthy" : "unhealthy",
      details:
        mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    };

    let redisStatus;
    try {
      await redisClient.ping();
      redisStatus = { status: "healthy", details: "Connected" };
    } catch (redisError) {
      redisStatus = { status: "unhealthy", details: redisError.message };
    }

    const healthReport = {
      server: serverStatus,
      mongodb: mongoStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString(),
    };

    logger.info("Health check completed", healthReport); // Log full report
    return res
      .status(200)
      .json(
        formatSuccessResponse("System health check completed", healthReport)
      );
  } catch (error) {
    next(error);
  }
};

module.exports = { checkHealth };
