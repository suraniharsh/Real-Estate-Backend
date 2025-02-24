const multer = require("multer");
const { formatErrorResponse } = require("../utils/response");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(
        new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed")
      );
    }
    cb(null, true);
  },
}).array("media", 10);

const multerMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json(formatErrorResponse(err.message));
    }
    next();
  });
};

module.exports = { multerMiddleware };
