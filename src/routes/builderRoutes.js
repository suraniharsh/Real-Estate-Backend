const express = require("express");
const {
  registerBuilder,
  getBuilderProfile,
  updateBuilderProfile,
} = require("../controllers/builderController");
const {
  validate,
  registerBuilderSchema,
  updateBuilderProfileSchema,
} = require("../middleware/validate");
const { authMiddleware } = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../middleware/multer");

const router = express.Router();

// Register a Builder
router.post("/register", validate(registerBuilderSchema), registerBuilder);

// Get Builder's own profile (authenticated)
router.get("/profile", authMiddleware, getBuilderProfile);

// Get any Builder's profile (public or authenticated)
router.get("/:builderId/profile", getBuilderProfile);

// Update Builder's own profile (authenticated)
router.put(
  "/profile",
  authMiddleware,
  validate(updateBuilderProfileSchema),
  multerMiddleware,
  updateBuilderProfile
);

module.exports = router;
