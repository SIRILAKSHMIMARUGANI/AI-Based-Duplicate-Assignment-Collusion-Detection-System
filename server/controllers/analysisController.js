
const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const Assignment = require("../models/Assignment");
const Submission = require("../models/Submission");

const compareSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    // 1. Find the assignment
    const assignment = await Assignment.findById(assignmentId);

    if (!assignment) {
      return res.status(404).json({
        message: "Assignment does not exist.",
      });
    }

    // 2. Check faculty ownership
    const assignmentFacultyId = String(assignment.faculty);
    const loggedInFacultyId = String(req.user._id);

    console.log("Assignment ID:", assignmentId);
    console.log("Assignment Faculty:", assignmentFacultyId);
    console.log("Logged-in Faculty:", loggedInFacultyId);

    if (assignmentFacultyId !== loggedInFacultyId) {
      return res.status(403).json({
        message: "Faculty ID mismatch. Please log in with the assignment owner account.",
      });
    }

    // 3. Get all submissions for this assignment
    const submissions = await Submission.find({
      assignment: assignmentId,
    }).populate("student", "name email");

    if (submissions.length < 2) {
      return res.status(400).json({
        message: "At least two student submissions are required.",
      });
    }

    // 4. Compare every pair of submissions
    const results = [];

    for (let i = 0; i < submissions.length; i++) {
      for (let j = i + 1; j < submissions.length; j++) {

        const first = submissions[i];
        const second = submissions[j];

        // Skip if either file is missing
        if (
          !first.filePath ||
          !second.filePath ||
          !fs.existsSync(first.filePath) ||
          !fs.existsSync(second.filePath)
        ) {
          console.log("Skipping pair because a file is missing.");
          continue;
        }

        // Prepare files for Python AI service
        const form = new FormData();

        form.append(
          "file1",
          fs.createReadStream(first.filePath),
          first.fileName
        );

        form.append(
          "file2",
          fs.createReadStream(second.filePath),
          second.fileName
        );

        // Send files to Python AI
        const response = await axios.post(
          "http://localhost:8000/compare-files",
          form,
          {
            headers: form.getHeaders(),
            maxBodyLength: Infinity,
          }
        );

        // Store comparison result in response
        results.push({
  student1: first.student?.name || "Student",
  student2: second.student?.name || "Student",
  file1: first.fileName,
  file2: second.fileName,
  similarityPercentage: response.data.similarity_percentage,
  matchedPassages: response.data.matched_passages || [],
});
      }
    }

    // 5. Send final results
    return res.status(200).json({
      message: "Assignment comparison completed successfully.",
      assignment: assignment.title,
      totalSubmissions: submissions.length,
      totalComparisons: results.length,
      results,
    });

  } catch (error) {
    console.error(
      "Comparison error:",
      error.response?.data || error.message
    );

    return res.status(500).json({
      message: "Failed to compare submissions.",
      error: error.response?.data?.error || error.message,
    });
  }
};

module.exports = { compareSubmissions };
