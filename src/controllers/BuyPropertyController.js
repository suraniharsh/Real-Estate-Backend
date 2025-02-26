const Property = require("../models/propertyModel");
const { formatSuccessResponse, formatErrorResponse } = require("../utils/response");
const { logger } = require("../utils/logger");

const buyProperty = async (req, res, next) => {
  try {
    const { propertyId } = req.params;
    const { userId, userType } = req.user; // Buyer details from token
    const { offerPrice, paymentMethod } = req.body;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json(formatErrorResponse("Property not found"));
    }
    if (property.propertyDetails.status !== "available") {
      return res.status(400).json(formatErrorResponse("Property is not available for purchase"));
    }

    // Update property details
    property.propertyDetails.status = "sold";
    property.propertyDetails.buyerId = userId;
    property.propertyDetails.offerPrice = offerPrice;
    property.propertyDetails.paymentMethod = paymentMethod;
    property.propertyDetails.soldAt = new Date();

    await property.save();
    logger.info("Property purchased", { propertyId, buyerId: userId });

    return res.status(200).json(
      formatSuccessResponse("Property purchased successfully", {
        propertyId: property._id.toString(),
        newStatus: property.propertyDetails.status,
        buyerId: userId,
        offerPrice,
        paymentMethod,
      })
    );
  } catch (error) {
    logger.error("Failed to purchase property", { error: error.message });
    next(error);
  }
};
const rentProperty = async (req, res, next) => {
    try {
      const { propertyId } = req.params;
      const { userId } = req.user; // Renter details from token
      const { rentPrice, rentalDuration, paymentMethod } = req.body;
  
      const property = await Property.findById(propertyId);
      if (!property) {
        return res.status(404).json(formatErrorResponse("Property not found"));
      }
      if (property.propertyDetails.status !== "available") {
        return res.status(400).json(formatErrorResponse("Property is not available for rent"));
      }
  
      // Update property details
      property.propertyDetails.status = "rented";
      property.propertyDetails.renterId = userId;
      property.propertyDetails.rentPrice = rentPrice;
      property.propertyDetails.rentalDuration = rentalDuration;
      property.propertyDetails.paymentMethod = paymentMethod;
      property.propertyDetails.rentedAt = new Date();
  
      await property.save();
      logger.info("Property rented", { propertyId, renterId: userId });
  
      return res.status(200).json(
        formatSuccessResponse("Property rented successfully", {
          propertyId: property._id.toString(),
          newStatus: property.propertyDetails.status,
          renterId: userId,
          rentPrice,
          rentalDuration,
          paymentMethod,
        })
      );
    } catch (error) {
      logger.error("Failed to rent property", { error: error.message });
      next(error);
    }
  };

module.exports = {
  buyProperty,
  rentProperty
};
