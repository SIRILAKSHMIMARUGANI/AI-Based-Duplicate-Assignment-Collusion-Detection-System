const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");
const Submission = require("../models/Submission");
const Assignment = require("../models/Assignment");

const createSubmission = async (req, res) => {
  try {
    const { assignmentId } = req.body;

    if (!assignmentId || !req.file) {
      return res.status(400).json({
        message: "Assignment ID and file are required.",
      });
    }

    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment not found.",
      });
    }

    if (
      assignment.status !== "Active" ||
      new Date(assignment.deadline) <= new Date()
    ) {
      return res.status(400).json({
        message: "This assignment is closed.",
      });
    }

    const existing = await Submission.findOne({
      assignment: assignmentId,
      student: req.user._id,
    });

    if (existing) {
      return res.status(409).json({
        message: "You have already submitted this assignment.",
      });
    }

    const submission = await Submission.create({
      assignment: assignmentId,
      student: req.user._id,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: req.file.mimetype,
    });

    res.status(201).json({
      message: "Assignment submitted successfully!",
      submission,
    });
  } catch (error) {
    console.error("Submission error:", error.message);

    res.status(500).json({
      message: "Failed to submit assignment.",
    });
  }
};

const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({
      student: req.user._id,
    })
      .populate("assignment", "title subject deadline")
      .sort({ submittedAt: -1 });

    res.status(200).json({
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch submissions.",
    });
  }
};

module.exports = {
  createSubmission,
  getMySubmissions,
};
