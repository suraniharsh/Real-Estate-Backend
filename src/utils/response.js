const formatSuccessResponse = (message, data = {}) => ({
  success: true,
  message,
  data,
});

const formatErrorResponse = (message, details = {}) => ({
  success: false,
  error: message,
  details,
});

module.exports = { formatSuccessResponse, formatErrorResponse };
