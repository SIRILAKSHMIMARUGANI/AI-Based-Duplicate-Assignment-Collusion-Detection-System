
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const submissionRoutes = require("./routes/submissionRoutes");
const analysisRoutes = require("./routes/analysisRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/analysis", analysisRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to IntelliCheck API!"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "success",
    database: require("mongoose").connection.readyState === 1
      ? "connected"
      : "disconnected"
  });
});

const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`IntelliCheck server running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Cannot start server without MongoDB.");
    process.exit(1);
  }
};

startServer();
