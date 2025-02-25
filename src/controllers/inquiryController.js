const { v4: uuidv4 } = require("uuid");
const Inquiry = require("../models/inquiryModel");
const { formatSuccessResponse, formatErrorResponse } = require("../utils/response");
const { logger } = require("../utils/logger");

const createInquiry = async (req, res, next) => {
  try {
    const { propertyId, customerId, message } = req.body;
    
    if (!propertyId || !customerId || !message) {
      return res.status(400).json(formatErrorResponse("All fields are required"));
    }

    const inquiry = new Inquiry({
      propertyId,
      customerId,
      message,
      status: "pending",
    });
    
    await inquiry.save();
    
    logger.info("Inquiry created successfully", { inquiryId: inquiry._id });
    
    return res.status(201).json(formatSuccessResponse("Inquiry submitted successfully", { inquiryId: inquiry._id }));
  } catch (error) {
    logger.error("Inquiry creation failed", { error: error.message });
    next(error);
  }
};

const getInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find().populate("propertyId customerId");
    return res.status(200).json(formatSuccessResponse("Inquiries retrieved successfully", inquiries));
  } catch (error) {
    logger.error("Failed to retrieve inquiries", { error: error.message });
    next(error);
  }
};

const updateInquiryStatus = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;
    const { status } = req.body;

    if (!["pending", "responded"].includes(status)) {
      return res.status(400).json(formatErrorResponse("Invalid status value"));
    }

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json(formatErrorResponse("Inquiry not found"));
    }

    inquiry.status = status;
    await inquiry.save();

    logger.info("Inquiry status updated", { inquiryId, status });
    return res.status(200).json(formatSuccessResponse("Inquiry status updated successfully", { inquiryId, status }));
  } catch (error) {
    logger.error("Failed to update inquiry status", { error: error.message });
    next(error);
  }
};

const deleteInquiry = async (req, res, next) => {
  try {
    const { inquiryId } = req.params;

    const inquiry = await Inquiry.findById(inquiryId);
    if (!inquiry) {
      return res.status(404).json(formatErrorResponse("Inquiry not found"));
    }

    await inquiry.remove();

    logger.info("Inquiry deleted", { inquiryId });
    return res.status(200).json(formatSuccessResponse("Inquiry deleted successfully", { inquiryId }));
  } catch (error) {
    logger.error("Failed to delete inquiry", { error: error.message });
    next(error);
  }
};

const getAllInquiries = async (req, res, next) => {
  try {
    const inquiries = await Inquiry.find();

    return res.status(200).json(formatSuccessResponse("Inquiries retrieved successfully", { inquiries }));
  } catch (error) {
    logger.error("Failed to retrieve inquiries", { error: error.message });
    next(error);
  }
};


module.exports = { createInquiry, getInquiries, updateInquiryStatus,getAllInquiries , deleteInquiry };
