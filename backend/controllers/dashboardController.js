const Habit = require("../models/Habit");
const CompletionLog = require("../models/CompletionLog");
const Streak = require("../models/Streak");
const User = require("../models/User");

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // user info
    const user = await User.findById(userId).select("name");

    // user habits
    const habits = await Habit.find({ userId });

    // today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // completions ONLY for today
    const todayCompletions = await CompletionLog.find({
      habitId: { $in: habits.map(h => h._id) },
      date: { $gte: today, $lt: tomorrow }
    });

    // all streaks
    const streaks = await Streak.find({
      habitId: { $in: habits.map(h => h._id) }
    });

    // percentage calculation (FIXED)
    let percentage = 0;
    if (habits.length > 0) {
      percentage = Math.min(
        Math.round((todayCompletions.length / habits.length) * 100),
        100
      );
    }

    res.json({
      userName: user?.name || "User",
      totalHabits: habits.length,
      todayCompletions: todayCompletions.length,
      percentage,
      streaks
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};
