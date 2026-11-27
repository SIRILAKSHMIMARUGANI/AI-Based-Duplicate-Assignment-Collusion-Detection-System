const express = require("express");
const router = express.Router();

const {
  createAssignment,
  getAssignments,
} = require("../controllers/assignmentController");

const { protect, authorize } = require("../middleware/authMiddleware");

// Faculty can create assignments
router.post("/", protect, authorize("Faculty"), createAssignment);

// Any logged-in user can view assignments
router.get("/", protect, getAssignments);

module.exports = router;