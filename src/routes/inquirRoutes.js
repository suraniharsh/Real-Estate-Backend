const express = require("express");
const router = express.Router();
const inquiryController = require("../controllers/inquiryController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, inquiryController.createInquiry);
router.get("/:inquiryId", authMiddleware, inquiryController.getInquiries);
router.get("/", authMiddleware, inquiryController.getAllInquiries);
router.put("/:inquiryId", authMiddleware, inquiryController.updateInquiryStatus);
router.delete("/:inquiryId", authMiddleware, inquiryController.deleteInquiry);

module.exports = router;
