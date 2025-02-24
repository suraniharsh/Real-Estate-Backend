const { v4: uuidv4 } = require("uuid");
const { signToken } = require("../config/jwt");
const {
  generateOTP,
  sendOTP,
  storeOTP,
  verifyOTP,
} = require("../services/otpService");
const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("../utils/response");
const { logger } = require("../utils/logger");
const Customer = require("../models/customerModel");
const Agent = require("../models/agentModel");
const Builder = require("../models/builderModel");

const sendOtp = async (req, res, next) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber || !/^\+\d{10,15}$/.test(phoneNumber)) {
      return res.status(400).json(formatErrorResponse("Invalid phone number"));
    }

    const customer = await Customer.findOne({ phoneNumber });
    const agent = await Agent.findOne({ phoneNumber });
    const builder = await Builder.findOne({ phoneNumber });

    let user, userType;
    if (customer) {
      user = customer;
      userType = "customer";
    } else if (agent) {
      user = agent;
      userType = "agent";
    } else if (builder) {
      user = builder;
      userType = "builder";
    } else {
      return res.status(404).json(formatErrorResponse("User not found"));
    }

    const otp = generateOTP();
    const requestId = uuidv4();

    await storeOTP(phoneNumber, otp, requestId);
    await sendOTP(phoneNumber, otp);

    logger.info("OTP sent", { phoneNumber, userType, requestId });

    return res
      .status(200)
      .json(formatSuccessResponse("OTP sent successfully", { requestId }));
  } catch (error) {
    logger.error("Failed to send OTP", { error: error.message });
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { phoneNumber, otp, requestId } = req.body;
    if (!phoneNumber || !otp || !requestId) {
      return res
        .status(400)
        .json(formatErrorResponse("Missing required fields"));
    }

    await verifyOTP(phoneNumber, otp, requestId);

    const customer = await Customer.findOne({ phoneNumber });
    const agent = await Agent.findOne({ phoneNumber });
    const builder = await Builder.findOne({ phoneNumber });

    let user, userType;
    if (customer) {
      user = customer;
      userType = "customer";
    } else if (agent) {
      user = agent;
      userType = "agent";
    } else if (builder) {
      user = builder;
      userType = "builder";
    } else {
      return res.status(404).json(formatErrorResponse("User not found"));
    }

    if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
      logger.info("User verified successfully", { phoneNumber, userType });
    }

    const payload = {
      phoneNumber,
      userType,
      userId: user._id.toString(),
    };

    const token = signToken(payload);
    return res.status(200).json(
      formatSuccessResponse("OTP verified successfully", {
        token,
        userType,
        userId: payload.userId,
      })
    );
  } catch (error) {
    logger.error("OTP verification failed", { error: error.message });
    return res.status(401).json(formatErrorResponse(error.message));
  }
};

module.exports = { sendOtp, verifyOtp };
