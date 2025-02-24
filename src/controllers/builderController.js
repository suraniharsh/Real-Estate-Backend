const { v4: uuidv4 } = require("uuid");
const Builder = require("../models/builderModel");
const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("../utils/response");
const { logger } = require("../utils/logger");
const { generateOTP, sendOTP, storeOTP } = require("../services/otpService");
const { uploadProfileImg } = require("../services/s3Service");

const registerBuilder = async (req, res, next) => {
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

    const existingBuilder = await Builder.findOne({
      $or: [{ phoneNumber }, { email }],
    });
    if (existingBuilder) {
      const field =
        existingBuilder.phoneNumber === phoneNumber ? "Phone number" : "Email";
      return res
        .status(409)
        .json(formatErrorResponse(`${field} already registered`));
    }

    const builder = new Builder({
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

    await builder.save();

    const otp = generateOTP();
    const requestId = uuidv4();
    await storeOTP(phoneNumber, otp, requestId);
    await sendOTP(phoneNumber, otp);

    logger.info("Builder registered and OTP sent", {
      phoneNumber,
      userId: builder._id,
    });

    return res.status(201).json(
      formatSuccessResponse(
        "Builder registered successfully, please verify OTP",
        {
          userId: builder._id.toString(),
          requestId,
        }
      )
    );
  } catch (error) {
    logger.error("Builder registration failed", { error: error.message });
    if (error.code === 11000) {
      const field = error.keyValue.phoneNumber ? "Phone number" : "Email";
      return res
        .status(409)
        .json(formatErrorResponse(`${field} already exists`));
    }
    next(error);
  }
};

const getBuilderProfile = async (req, res, next) => {
  try {
    const builderId =
      req.user && !req.params.builderId
        ? req.user.userId
        : req.params.builderId;
    if (!builderId) {
      return res
        .status(400)
        .json(formatErrorResponse("Builder ID required or JWT token missing"));
    }

    const builder = await Builder.findById(builderId).select("-password");
    if (!builder) {
      return res.status(404).json(formatErrorResponse("Builder not found"));
    }

    const isOwnProfile =
      req.user &&
      req.user.userId === builderId &&
      req.user.userType === "builder";

    const profileData = {
      userId: builder._id.toString(),
      fullName: builder.fullName,
      profileImg: builder.profileImg,
      companyName: builder.companyName,
      location: builder.location,
      specialization: builder.specialization,
      yearsOfExperience: builder.yearsOfExperience,
      subscriptionPlan: builder.subscriptionPlan,
    };

    if (isOwnProfile) {
      profileData.phoneNumber = builder.phoneNumber;
      profileData.email = builder.email;
    }

    return res
      .status(200)
      .json(
        formatSuccessResponse(
          "Builder profile retrieved successfully",
          profileData
        )
      );
  } catch (error) {
    logger.error("Failed to retrieve builder profile", {
      error: error.message,
    });
    next(error);
  }
};

const updateBuilderProfile = async (req, res, next) => {
  try {
    const builderId = req.user.userId;
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

    const builder = await Builder.findById(builderId);
    if (!builder) {
      return res.status(404).json(formatErrorResponse("Builder not found"));
    }
    if (
      builder._id.toString() !== req.user.userId ||
      req.user.userType !== "builder"
    ) {
      return res.status(401).json(formatErrorResponse("Unauthorized"));
    }

    let updated = false;

    if (email) {
      builder.email = email;
      updated = true;
    }
    if (fullName) {
      builder.fullName = fullName;
      updated = true;
    }
    if (password) {
      builder.password = password;
      updated = true;
    }
    if (companyName) {
      builder.companyName = companyName;
      updated = true;
    }
    if (location) {
      builder.location = { ...builder.location, ...location };
      updated = true;
    }
    if (specialization) {
      builder.specialization = specialization;
      updated = true;
    }
    if (yearsOfExperience !== undefined) {
      builder.yearsOfExperience = yearsOfExperience;
      updated = true;
    }
    if (subscriptionPlan) {
      builder.subscriptionPlan = subscriptionPlan;
      updated = true;
    }

    if (file) {
      const profileImgUrl = await uploadProfileImg(
        builder._id.toString(),
        file.buffer,
        file.mimetype,
        "builder-profile"
      );
      builder.profileImg = profileImgUrl;
      updated = true;
    }

    if (updated) {
      await builder.save();
      logger.info("Builder profile updated", { userId: builder._id });

      const profileData = {
        userId: builder._id.toString(),
        phoneNumber: builder.phoneNumber,
        email: builder.email,
        fullName: builder.fullName,
        profileImg: builder.profileImg,
        companyName: builder.companyName,
        location: builder.location,
        specialization: builder.specialization,
        yearsOfExperience: builder.yearsOfExperience,
        subscriptionPlan: builder.subscriptionPlan,
      };

      return res
        .status(200)
        .json(
          formatSuccessResponse(
            "Builder profile updated successfully",
            profileData
          )
        );
    } else {
      return res.status(400).json(formatErrorResponse("No updates provided"));
    }
  } catch (error) {
    logger.error("Builder profile update failed", { error: error.message });
    if (error.code === 11000) {
      return res
        .status(409)
        .json(formatErrorResponse("Email or phone number already exists"));
    }
    next(error);
  }
};

module.exports = { registerBuilder, getBuilderProfile, updateBuilderProfile };
