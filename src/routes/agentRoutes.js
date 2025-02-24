const express = require("express");
const {
  registerAgent,
  getAgentProfile,
  updateAgentProfile,
} = require("../controllers/agentController");
const {
  validate,
  registerAgentSchema,
  updateAgentProfileSchema,
} = require("../middleware/validate");
const { authMiddleware } = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../middleware/multer");

const router = express.Router();

// Register an Agent
router.post("/register", validate(registerAgentSchema), registerAgent);

// Get Agent's own profile (authenticated)
router.get("/profile", authMiddleware, getAgentProfile);

// Get any Agent's profile (public or authenticated)
router.get("/:agentId/profile", getAgentProfile);

// Update Agent's own profile (authenticated)
router.put(
  "/profile",
  authMiddleware,
  validate(updateAgentProfileSchema),
  multerMiddleware,
  updateAgentProfile
);

module.exports = router;
