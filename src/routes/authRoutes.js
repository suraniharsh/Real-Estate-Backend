const express = require("express");
const { sendOtp, verifyOtp } = require("../controllers/authController");
const { otpRateLimit } = require("../middleware/rateLimit");
const { validate, verifyOtpSchema } = require("../middleware/validate");

const router = express.Router();

router.post("/send-otp", otpRateLimit, sendOtp);
router.post("/verify-otp", validate(verifyOtpSchema), verifyOtp);

module.exports = router;
