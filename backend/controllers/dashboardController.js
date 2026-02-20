const Habit = require("../models/Habit");
const CompletionLog = require("../models/CompletionLog");
const Streak = require("../models/Streak");
const User = require("../models/User");

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user;

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
      habitId: { $in: habits.map((h) => h._id) },
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    // all completions for this user (used by frontend to render weekly grid and counts)
    const completions = await CompletionLog.find({ userId }).sort({ date: -1 });

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
      completions,
      streaks
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user;

    const habits = await Habit.find({ userId }).select("_id frequency");
    const habitIds = habits.map((h) => h._id);

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const start7 = new Date(startOfToday);
    start7.setDate(start7.getDate() - 6);

    const start30 = new Date(startOfToday);
    start30.setDate(start30.getDate() - 29);

    const start180 = new Date(startOfToday);
    start180.setDate(start180.getDate() - 179);

    // daily intensity: date -> number of unique habits completed that day
    const daily = await CompletionLog.aggregate([
      {
        $match: {
          userId: userId,
          habitId: { $in: habitIds },
          date: { $gte: start180, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
            habitId: "$habitId",
          },
        },
      },
      {
        $group: {
          _id: "$_id.day",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const dateToCount = daily.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const uniqueHabitDaysInRange = async (start, end) => {
      const rows = await CompletionLog.aggregate([
        {
          $match: {
            userId: userId,
            habitId: { $in: habitIds },
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: {
              day: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
              habitId: "$habitId",
            },
          },
        },
      ]);
      return rows.length;
    };

    const weeklyPairs = await uniqueHabitDaysInRange(start7, now);
    const monthlyPairs = await uniqueHabitDaysInRange(start30, now);

    const weeklyExpected = habits.reduce((acc, h) => acc + (h.frequency === "weekly" ? 1 : 7), 0);
    const monthlyExpected = habits.reduce((acc, h) => acc + (h.frequency === "weekly" ? 4 : 30), 0);

    const weeklyPercentage = weeklyExpected > 0 ? Math.min(Math.round((weeklyPairs / weeklyExpected) * 100), 100) : 0;
    const monthlyPercentage = monthlyExpected > 0 ? Math.min(Math.round((monthlyPairs / monthlyExpected) * 100), 100) : 0;

    res.json({
      habitCount: habits.length,
      weekly: {
        completedPairs: weeklyPairs,
        expectedPairs: weeklyExpected,
        percentage: weeklyPercentage,
        startDate: start7,
        endDate: now,
      },
      monthly: {
        completedPairs: monthlyPairs,
        expectedPairs: monthlyExpected,
        percentage: monthlyPercentage,
        startDate: start30,
        endDate: now,
      },
      dailySeries: daily.map((r) => ({ date: r._id, count: r.count })),
      dateToCount,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    res.status(500).json({ message: "Failed to fetch dashboard analytics" });
  }
};
