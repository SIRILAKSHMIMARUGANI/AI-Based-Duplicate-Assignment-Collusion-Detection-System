
const Assignment = require("../models/Assignment");

// Create a new assignment
const createAssignment = async (req, res) => {
  try {
    const { title, description, subject, deadline } = req.body;

    const assignment = await Assignment.create({
      title,
      description,
      subject,
      deadline,
      faculty: req.user._id,
    });

    return res.status(201).json({
      message: "Assignment created successfully.",
      assignment,
    });
  } catch (error) {
    console.error("Create assignment error:", error.message);

    return res.status(500).json({
      message: "Failed to create assignment.",
      error: error.message,
    });
  }
};

// Get assignments
const getAssignments = async (req, res) => {
  try {
    let filter = {};

    // Faculty sees only assignments created by their account
    if (req.user.role === "Faculty") {
      filter.faculty = req.user._id;
    }

    // Students can see all assignments
    const assignments = await Assignment.find(filter)
      .populate("faculty", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Get assignments error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch assignments.",
      error: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
};
