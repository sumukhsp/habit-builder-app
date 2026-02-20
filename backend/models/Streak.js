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
  currentStartDate: {
    type: Date,
    default: null
  },
  currentEndDate: {
    type: Date,
    default: null
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  longestStartDate: {
    type: Date,
    default: null
  },
  longestEndDate: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("Streak", streakSchema);
