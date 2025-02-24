const express = require("express");
const {
  registerCustomer,
  getProfile,
  updateProfile,
} = require("../controllers/customerController");
const {
  validate,
  registerCustomerSchema,
  updateProfileSchema,
} = require("../middleware/validate");
const { authMiddleware } = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../middleware/multer");

const router = express.Router();

router.post("/register", validate(registerCustomerSchema), registerCustomer);
router.get("/profile", authMiddleware, getProfile);
router.put(
  "/profile",
  authMiddleware,
  validate(updateProfileSchema),
  multerMiddleware,
  updateProfile
);

module.exports = router;
