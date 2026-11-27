
const express = require("express");
const router = express.Router();

const {
  createSubmission,
  getMySubmissions,
} = require("../controllers/submissionController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.post(
  "/",
  protect,
  authorize("Student"),
  upload.single("file"),
  createSubmission
);

router.get(
  "/my",
  protect,
  authorize("Student"),
  getMySubmissions
);

module.exports = router;
