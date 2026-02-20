const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getDashboardStats, getDashboardAnalytics } = require("../controllers/dashboardController");

router.get("/stats", authMiddleware, getDashboardStats);
router.get("/analytics", authMiddleware, getDashboardAnalytics);

module.exports = router;
