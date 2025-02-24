const Property = require("../models/propertyModel");
const {
  formatSuccessResponse,
  formatErrorResponse,
} = require("../utils/response");
const { logger } = require("../utils/logger");
const { uploadPropertyImg } = require("../services/s3Service");

const postProperty = async (req, res, next) => {
  try {
    const { userId, userType } = req.user; // From token
    let { propertyDetails, additionalDetails, contactInfo, visibility } =
      req.body;
    const files = req.files;

    // Parse JSON strings from form-data
    propertyDetails =
      typeof propertyDetails === "string"
        ? JSON.parse(propertyDetails)
        : propertyDetails;
    contactInfo =
      typeof contactInfo === "string" ? JSON.parse(contactInfo) : contactInfo;
    additionalDetails =
      additionalDetails && typeof additionalDetails === "string"
        ? JSON.parse(additionalDetails)
        : additionalDetails;

    const mediaUrls = [];
    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadPropertyImg(
          userId,
          file.buffer,
          file.mimetype,
          "property-media"
        );
        mediaUrls.push(url);
      }
    }

    const property = new Property({
      userId,
      userType,
      propertyDetails,
      media: mediaUrls,
      additionalDetails,
      contactInfo,
      visibility,
    });

    await property.save();
    logger.info("Property posted", { propertyId: property._id, userId });

    return res.status(201).json(
      formatSuccessResponse("Property posted successfully", {
        propertyId: property._id.toString(),
      })
    );
  } catch (error) {
    logger.error("Failed to post property", { error: error.message });
    next(error);
  }
};

const getUserProperties = async (req, res, next) => {
  try {
    const { userId, userType } = req.user; // From token
    const { status, page = 1, limit = 10 } = req.query;

    const query = { userId, userType };
    if (status) query["propertyDetails.status"] = status;

    const properties = await Property.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select(
        "propertyDetails.title propertyDetails.status propertyDetails.propertyStatus media views comments"
      );

    const total = await Property.countDocuments(query);

    return res.status(200).json(
      formatSuccessResponse("Properties retrieved successfully", {
        listings: properties.map((p) => ({
          propertyId: p._id.toString(),
          title: p.propertyDetails.title,
          status: p.propertyDetails.status,
          propertyStatus: p.propertyDetails.propertyStatus,
          media: p.media,
          views: p.views,
          comments: p.comments,
        })),
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / limit),
        },
      })
    );
  } catch (error) {
    logger.error("Failed to retrieve properties", { error: error.message });
    next(error);
  }
};

const getPropertiesById = async (req, res, next) => {
  try {
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId).select(
      "propertyDetails media additionalDetails contactInfo visibility userType"
    );

    if (!property) {
      return res.status(404).json(formatErrorResponse("Property not found"));
    }

    return res.status(200).json(
      formatSuccessResponse("Property retrieved successfully", {
        property: {
          propertyId: property._id.toString(),
          propertyDetails: property.propertyDetails,
          media: property.media,
          additionalDetails: property.additionalDetails,
          contactInfo: property.contactInfo,
          visibility: property.visibility,
          userType: property.userType,
        },
      })
    );
  } catch (error) {
    logger.error("Failed to retrieve property", { error: error.message });
    next(error);
  }
};

const deleteProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { userId, userType } = req.user; // From token

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json(formatErrorResponse("Property not found"));
    }
    if (
      property.userId.toString() !== userId ||
      property.userType !== userType
    ) {
      return res.status(401).json(formatErrorResponse("Unauthorized"));
    }

    await property.remove();
    logger.info("Property deleted", { propertyId });

    return res
      .status(200)
      .json(formatSuccessResponse("Property deleted successfully"));
  } catch (error) {
    logger.error("Failed to delete property", { error: error.message });
    next(error);
  }
};

const uploadPropertyImages = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { userId, userType } = req.user; // From token
    const files = req.files;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json(formatErrorResponse("Property not found"));
    }
    if (
      property.userId.toString() !== userId ||
      property.userType !== userType
    ) {
      return res.status(401).json(formatErrorResponse("Unauthorized"));
    }

    if (!files || files.length === 0) {
      return res.status(400).json(formatErrorResponse("No images provided"));
    }

    const mediaUrls = [];
    for (const file of files) {
      const url = await uploadPropertyImg(
        userId,
        file.buffer,
        file.mimetype,
        "property-media"
      );
      mediaUrls.push(url);
    }

    property.media = [...property.media, ...mediaUrls];
    await property.save();

    logger.info("Property images uploaded", {
      propertyId,
      userId,
      imageCount: mediaUrls.length,
    });

    return res.status(200).json(
      formatSuccessResponse("Images uploaded successfully", {
        media: property.media,
      })
    );
  } catch (error) {
    logger.error("Failed to upload property images", { error: error.message });
    next(error);
  }
};

module.exports = {
  postProperty,
  getUserProperties,
  getPropertiesById,
  deleteProperty,
  uploadPropertyImages,
};
