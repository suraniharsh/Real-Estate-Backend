const redis = require("redis");
const { logger } = require("../utils/logger");
require("dotenv").config(); // Load environment variables

const redisClient = redis.createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

redisClient
  .connect()
  .then(() => {
    logger.info("Redis connected");
  })
  .catch((err) => {
    logger.error("Redis connection error:", err);
  });

module.exports = redisClient;
