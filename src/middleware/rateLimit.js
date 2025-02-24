const rateLimit = require("express-rate-limit");

const otpRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 1, // 1 requests per IP
  message: "Too many OTP requests, please try again later",
});

module.exports = { otpRateLimit };
