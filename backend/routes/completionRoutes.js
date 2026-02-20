const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { markComplete, getHabitCompletions } = require("../controllers/completionController");

router.post("/complete", authMiddleware, markComplete);
router.get("/habit/:habitId", authMiddleware, getHabitCompletions);

module.exports = router;
