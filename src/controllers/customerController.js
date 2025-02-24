const { v4: uuidv4 } = require("uuid");
const Customer = require("../models/customerModel");
const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("../utils/response");
const { logger } = require("../utils/logger");
const { generateOTP, sendOTP, storeOTP } = require("../services/otpService");
const { uploadProfileImg } = require("../services/s3Service");

const registerCustomer = async (req, res, next) => {
  // Unchanged, keeping it for context
  try {
    const { phoneNumber, email, fullName, password } = req.body;

    const existingCustomer = await Customer.findOne({
      $or: [{ phoneNumber }, { email }],
    });
    if (existingCustomer) {
      const field =
        existingCustomer.phoneNumber === phoneNumber ? "Phone number" : "Email";
      return res
        .status(409)
        .json(formatErrorResponse(`${field} already registered`));
    }

    const customer = new Customer({
      phoneNumber,
      email,
      fullName,
      password,
      favorites: [],
      shortlists: [],
      isVerified: false,
    });

    await customer.save();

    const otp = generateOTP();
    const requestId = uuidv4();
    await storeOTP(phoneNumber, otp, requestId);
    await sendOTP(phoneNumber, otp);

    logger.info("Customer registered and OTP sent", {
      phoneNumber,
      userId: customer._id,
    });

    return res.status(201).json(
      formatSuccessResponse(
        "Customer registered successfully, please verify OTP",
        {
          userId: customer._id.toString(),
          requestId,
        }
      )
    );
  } catch (error) {
    logger.error("Customer registration failed", { error: error.message });
    if (error.code === 11000) {
      const field = error.keyValue.phoneNumber ? "Phone number" : "Email";
      return res
        .status(409)
        .json(formatErrorResponse(`${field} already exists`));
    }
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.user.userId).select(
      "-password"
    );
    if (!customer) {
      return res.status(404).json(formatErrorResponse("Customer not found"));
    }

    return res.status(200).json(
      formatSuccessResponse("Profile retrieved successfully", {
        userId: customer._id.toString(),
        phoneNumber: customer.phoneNumber,
        email: customer.email,
        fullName: customer.fullName,
        favorites: customer.favorites,
        shortlists: customer.shortlists,
        profileImg: customer.profileImg,
      })
    );
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { email, fullName, password } = req.body;
    const file = req.file;

    const customer = await Customer.findById(req.user.userId);
    if (!customer) {
      return res.status(404).json(formatErrorResponse("Customer not found"));
    }

    let updated = false;

    // Update fields if provided
    if (email) {
      customer.email = email;
      updated = true;
    }
    if (fullName) {
      customer.fullName = fullName;
      updated = true;
    }
    if (password) {
      customer.password = password; // Will be hashed by pre-save hook
      updated = true;
    }

    // Handle profile image upload
    if (file) {
      const profileImgUrl = await uploadProfileImg(
        customer._id.toString(),
        file.buffer,
        file.mimetype
      );
      customer.profileImg = profileImgUrl;
      updated = true;
    }

    // Save only if something was updated
    if (updated) {
      await customer.save();
      logger.info("Customer profile updated", { userId: customer._id });

      // Return updated profile data
      return res.status(200).json(
        formatSuccessResponse("Profile updated successfully", {
          userId: customer._id.toString(),
          phoneNumber: customer.phoneNumber,
          email: customer.email,
          fullName: customer.fullName,
          favorites: customer.favorites,
          shortlists: customer.shortlists,
          profileImg: customer.profileImg,
        })
      );
    } else {
      return res.status(400).json(formatErrorResponse("No updates provided"));
    }
  } catch (error) {
    logger.error("Profile update failed", { error: error.message });
    if (error.code === 11000) {
      return res.status(409).json(formatErrorResponse("Email already exists"));
    }
    next(error);
  }
};

module.exports = { registerCustomer, getProfile, updateProfile };
