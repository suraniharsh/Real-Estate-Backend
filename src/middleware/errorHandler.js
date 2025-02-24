const { formatErrorResponse } = require("../utils/response");
const { logError } = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  logError(err, req); // Log error with request details
  res
    .status(err.status || 500)
    .json(formatErrorResponse("An error occurred", err.message));
};

module.exports = errorHandler;
