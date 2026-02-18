const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Routes
const authRoutes = require("./routes/authRoutes");
const habitRoutes = require("./routes/habitRoutes");
const completionRoutes = require("./routes/completionRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/habits", habitRoutes);
app.use("/api/completion", completionRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Health Check Route
app.get("/health", (req, res) => {
  res.json({ status: "Server Running" });
});

// Default Route
app.get("/", (req, res) => {
  res.send("Habit Builder API Running");
});

// Error Middleware
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
