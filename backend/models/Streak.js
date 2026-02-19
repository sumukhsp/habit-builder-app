const mongoose = require("mongoose");

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habit"
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Streak", streakSchema);
