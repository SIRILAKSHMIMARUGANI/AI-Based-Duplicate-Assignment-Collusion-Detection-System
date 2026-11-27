
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    fileName: {
      type: String,
      required: true,
    },

    filePath: {
      type: String,
      required: true,
    },

    fileType: {
      type: String,
      required: true,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Submitted", "Under Review", "Evaluated"],
      default: "Submitted",
    },

    similarityScore: {
      type: Number,
      default: null,
    },
  },
  { timestamps: true }
);

// One submission per student per assignment
submissionSchema.index(
  { assignment: 1, student: 1 },
  { unique: true }
);

const Submission = mongoose.model("Submission", submissionSchema);

module.exports = Submission;
