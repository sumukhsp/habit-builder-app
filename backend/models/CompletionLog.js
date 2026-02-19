const mongoose = require("mongoose");

const completionLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Habit"
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("CompletionLog", completionLogSchema);
