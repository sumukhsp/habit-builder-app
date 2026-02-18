const CompletionLog = require("../models/CompletionLog");
const Streak = require("../models/Streak");

// Mark habit completed
exports.markComplete = async (req, res) => {
  try {
    const { habitId } = req.body;

    await CompletionLog.create({ habitId });

    let streak = await Streak.findOne({ habitId });

    if (!streak) {
      streak = await Streak.create({
        habitId,
        currentStreak: 1,
        longestStreak: 1
      });
    } else {
      streak.currentStreak += 1;
      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }
      await streak.save();
    }

    res.json({ message: "Habit marked complete", streak });

  } catch (error) {
    res.status(500).json(error.message);
  }
};
