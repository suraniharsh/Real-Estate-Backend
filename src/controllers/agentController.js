const { v4: uuidv4 } = require("uuid");
const Agent = require("../models/agentModel");
const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("../utils/response");
const { logger } = require("../utils/logger");
const { generateOTP, sendOTP, storeOTP } = require("../services/otpService");
const { uploadFile, uploadProfileImg } = require("../services/s3Service");

const registerAgent = async (req, res, next) => {
  try {
    const {
      phoneNumber,
      email,
      fullName,
      password,
      companyName,
      location,
      specialization,
      yearsOfExperience,
      subscriptionPlan,
    } = req.body;

    const existingAgent = await Agent.findOne({
      $or: [{ phoneNumber }, { email }],
    });
    if (existingAgent) {
      const field =
        existingAgent.phoneNumber === phoneNumber ? "Phone number" : "Email";
      return res
        .status(409)
        .json(formatErrorResponse(`${field} already registered`));
    }

    const agent = new Agent({
      phoneNumber,
      email,
      fullName,
      password,
      companyName,
      location,
      specialization,
      yearsOfExperience,
      subscriptionPlan,
      isVerified: false,
    });

    await agent.save();

    const otp = generateOTP();
    const requestId = uuidv4();
    await storeOTP(phoneNumber, otp, requestId);
    await sendOTP(phoneNumber, otp);

    logger.info("Agent registered and OTP sent", {
      phoneNumber,
      userId: agent._id,
    });

    return res.status(201).json(
      formatSuccessResponse(
        "Agent registered successfully, please verify OTP",
        {
          userId: agent._id.toString(),
          requestId,
        }
      )
    );
  } catch (error) {
    logger.error("Agent registration failed", { error: error.message });
    if (error.code === 11000) {
      const field =
        error.keyValue.phoneNumber === phoneNumber ? "Phone number" : "Email";
      return res
        .status(409)
        .json(formatErrorResponse(`${field} already exists`));
    }
    next(error);
  }
};

const getAgentProfile = async (req, res, next) => {
  try {
    // Use JWT agentId if authenticated and no :agentId provided, else use URL param
    const agentId =
      req.user && !req.params.agentId ? req.user.userId : req.params.agentId;
    if (!agentId) {
      return res
        .status(400)
        .json(formatErrorResponse("Agent ID required or JWT token missing"));
    }

    const agent = await Agent.findById(agentId).select("-password");
    if (!agent) {
      return res.status(404).json(formatErrorResponse("Agent not found"));
    }

    // Check if it's the agent's own profile
    const isOwnProfile =
      req.user && req.user.userId === agentId && req.user.userType === "agent";

    const profileData = {
      userId: agent._id.toString(),
      fullName: agent.fullName,
      profileImg: agent.profileImg,
      companyName: agent.companyName,
      location: agent.location,
      specialization: agent.specialization,
      yearsOfExperience: agent.yearsOfExperience,
      subscriptionPlan: agent.subscriptionPlan,
    };

    if (isOwnProfile) {
      profileData.phoneNumber = agent.phoneNumber;
      profileData.email = agent.email;
    }

    return res
      .status(200)
      .json(
        formatSuccessResponse(
          "Agent profile retrieved successfully",
          profileData
        )
      );
  } catch (error) {
    logger.error("Failed to retrieve agent profile", { error: error.message });
    next(error);
  }
};

const updateAgentProfile = async (req, res, next) => {
  try {
    const agentId = req.user.userId; // Always use JWT agentId
    const {
      email,
      fullName,
      password,
      companyName,
      location,
      specialization,
      yearsOfExperience,
      subscriptionPlan,
    } = req.body;
    const file = req.file;

    const agent = await Agent.findById(agentId);
    if (!agent) {
      return res.status(404).json(formatErrorResponse("Agent not found"));
    }
    if (
      agent._id.toString() !== req.user.userId ||
      req.user.userType !== "agent"
    ) {
      return res.status(401).json(formatErrorResponse("Unauthorized"));
    }

    let updated = false;

    if (email) {
      agent.email = email;
      updated = true;
    }
    if (fullName) {
      agent.fullName = fullName;
      updated = true;
    }
    if (password) {
      agent.password = password;
      updated = true;
    }
    if (companyName) {
      agent.companyName = companyName;
      updated = true;
    }
    if (location) {
      agent.location = { ...agent.location, ...location };
      updated = true;
    }
    if (specialization) {
      agent.specialization = specialization;
      updated = true;
    }
    if (yearsOfExperience !== undefined) {
      agent.yearsOfExperience = yearsOfExperience;
      updated = true;
    }
    if (subscriptionPlan) {
      agent.subscriptionPlan = subscriptionPlan;
      updated = true;
    }

    if (file) {
      const profileImgUrl = await uploadProfileImg(
        agent._id.toString(),
        file.buffer,
        file.mimetype,
        "agent-profile"
      );
      agent.profileImg = profileImgUrl;
      updated = true;
    }

    if (updated) {
      await agent.save();
      logger.info("Agent profile updated", { userId: agent._id });

      const profileData = {
        userId: agent._id.toString(),
        phoneNumber: agent.phoneNumber,
        email: agent.email,
        fullName: agent.fullName,
        profileImg: agent.profileImg,
        companyName: agent.companyName,
        location: agent.location,
        specialization: agent.specialization,
        yearsOfExperience: agent.yearsOfExperience,
        subscriptionPlan: agent.subscriptionPlan,
      };

      return res
        .status(200)
        .json(
          formatSuccessResponse(
            "Agent profile updated successfully",
            profileData
          )
        );
    } else {
      return res.status(400).json(formatErrorResponse("No updates provided"));
    }
  } catch (error) {
    logger.error("Agent profile update failed", { error: error.message });
    if (error.code === 11000) {
      return res
        .status(409)
        .json(formatErrorResponse("Email or phone number already exists"));
    }
    next(error);
  }
};

module.exports = { registerAgent, getAgentProfile, updateAgentProfile };
