
const express = require("express");
const router = express.Router();

const { compareSubmissions } = require("../controllers/analysisController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get(
  "/:assignmentId",
  protect,
  authorize("Faculty"),
  compareSubmissions
);

module.exports = router;
