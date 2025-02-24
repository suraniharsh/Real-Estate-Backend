const twilio = require("twilio");
const redisClient = require("../config/redis");
const { logger } = require("../utils/logger");
require("dotenv").config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via Twilio
const sendOTP = async (phoneNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP is ${otp}. Valid for 5 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });
    logger.info("OTP sent successfully", { phoneNumber });
  } catch (error) {
    logger.error("Failed to send OTP", { phoneNumber, error: error.message });
    throw new Error("Failed to send OTP");
  }
};

// Store OTP in Redis with a 5-minute expiration
const storeOTP = async (phoneNumber, otp, requestId) => {
  const key = `otp:${requestId}`;
  await redisClient.setEx(key, 300, JSON.stringify({ phoneNumber, otp })); // 300 seconds = 5 minutes
};

// Verify OTP from Redis
const verifyOTP = async (phoneNumber, otp, requestId) => {
  const key = `otp:${requestId}`;
  const storedData = await redisClient.get(key);
  if (!storedData) throw new Error("OTP expired or invalid request");

  const { phoneNumber: storedPhone, otp: storedOTP } = JSON.parse(storedData);
  if (storedPhone !== phoneNumber || storedOTP !== otp) {
    throw new Error("Invalid OTP");
  }
  await redisClient.del(key); // Delete OTP after verification
  return true;
};

module.exports = { generateOTP, sendOTP, storeOTP, verifyOTP };
