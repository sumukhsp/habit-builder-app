const Habit = require("../models/Habit");
const CompletionLog = require("../models/CompletionLog");
const Streak = require("../models/Streak");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalHabits = await Habit.countDocuments({ userId: req.user });
    const totalCompletions = await CompletionLog.countDocuments();

    const streaks = await Streak.find();

    res.json({
      totalHabits,
      totalCompletions,
      streaks
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};
