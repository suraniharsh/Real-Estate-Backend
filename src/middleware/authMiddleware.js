const { verifyToken } = require("../config/jwt");
const { formatErrorResponse } = require("../utils/response");
const { logger } = require("../utils/logger");

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) {
    return res.status(401).json(formatErrorResponse("No token provided"));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded; // Attach decoded user data (e.g., userId, phoneNumber)
    next();
  } catch (error) {
    logger.error("Invalid token", { error: error.message });
    return res
      .status(401)
      .json(formatErrorResponse("Invalid or expired token"));
  }
};

const restrictToAgentOrBuilder = (req, res, next) => {
  const { userType } = req.user;
  if (userType !== "agent" && userType !== "builder") {
    return res
      .status(403)
      .json(formatErrorResponse("Access restricted to agents and builders only"));
  }
  next();
};

module.exports = { authMiddleware, restrictToAgentOrBuilder };
