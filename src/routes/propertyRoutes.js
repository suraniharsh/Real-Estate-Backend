const express = require("express");
const {
  postProperty,
  getUserProperties,
  getPropertiesById,
  deleteProperty,
  uploadPropertyImages,
} = require("../controllers/propertyController");
const { validate, propertySchema } = require("../middleware/validate");
const {
  authMiddleware,
  restrictToAgentOrBuilder,
} = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../middleware/multer");

const router = express.Router();

// Create a new property
router.post(
  "/",
  authMiddleware,
  restrictToAgentOrBuilder,
  validate(propertySchema),
  multerMiddleware,
  postProperty
);

// Get authenticated user's properties (userId from token)
router.get("/me", authMiddleware, restrictToAgentOrBuilder, getUserProperties);

// Get property by ID (no authentication required)
router.get("/:propertyId", getPropertiesById);

// Delete a property
router.delete(
  "/:propertyId",
  authMiddleware,
  restrictToAgentOrBuilder,
  deleteProperty
);

// Upload images for a property
router.post(
  "/:propertyId/images",
  authMiddleware,
  restrictToAgentOrBuilder,
  multerMiddleware,
  uploadPropertyImages
);

module.exports = router;
