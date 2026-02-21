const mongoose = require("mongoose");

const habitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    enum: ["daily", "weekly"],
    default: "daily"
  },
  reminderTime: {
    type: String,
    default: "09:00"
  }
}, { timestamps: true });

module.exports = mongoose.model("Habit", habitSchema);
