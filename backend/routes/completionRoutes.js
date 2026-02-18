const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { markComplete } = require("../controllers/completionController");

router.post("/complete", authMiddleware, markComplete);

module.exports = router;
