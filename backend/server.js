const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// If behind a proxy (Railway/Render), this makes secure cookies / req.ip more reliable.
app.set("trust proxy", 1);

// Middleware
app.use(express.json());

// CORS
// Configure allowed origins via env, e.g.
// CORS_ORIGIN=https://your-frontend.netlify.app,https://your-frontend.vercel.app
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser requests (like Postman/curl) with no Origin header
      if (!origin) return cb(null, true);
      if (allowedOrigins.length === 0) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.options("*", cors());

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
  res.json({ status: "ok" });
});

// Default Route
app.get("/", (req, res) => {
  res.send("Habit Builder API Running");
});

// Error Middleware
const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5001;

const start = async () => {
  if (!process.env.MONGO_URI) {
    console.error("Missing required env var: MONGO_URI");
    process.exit(1);
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
