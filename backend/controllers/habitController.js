const Habit = require("../models/Habit");
const Streak = require("../models/Streak");
const CompletionLog = require("../models/CompletionLog");

// Create Habit
exports.createHabit = async (req, res) => {
  try {
    const habit = await Habit.create({
      userId: req.user,
      title: req.body.title,
      frequency: req.body.frequency,
      reminderTime: req.body.reminderTime || "09:00"
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: "Failed to create habit" });
  }
};

exports.getHabitAnalytics = async (req, res) => {
  try {
    const userId = req.user;
    const habitId = req.params.id;

    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const streak = await Streak.findOne({ userId, habitId });

    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    const start7 = new Date(startOfToday);
    start7.setDate(start7.getDate() - 6);

    const start30 = new Date(startOfToday);
    start30.setDate(start30.getDate() - 29);

    const start180 = new Date(startOfToday);
    start180.setDate(start180.getDate() - 179);

    const dailySeries = await CompletionLog.aggregate([
      {
        $match: {
          userId: userId,
          habitId: habit._id,
          date: { $gte: start180, $lte: now },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const seriesMap = dailySeries.reduce((acc, row) => {
      acc[row._id] = row.count;
      return acc;
    }, {});

    const countUniqueDaysInRange = async (start, end) => {
      const days = await CompletionLog.aggregate([
        {
          $match: {
            userId: userId,
            habitId: habit._id,
            date: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          },
        },
      ]);
      return days.length;
    };

    const weeklyCompletedDays = await countUniqueDaysInRange(start7, now);
    const monthlyCompletedDays = await countUniqueDaysInRange(start30, now);

    const weeklyExpected = habit.frequency === "weekly" ? 1 : 7;
    const monthlyExpected = habit.frequency === "weekly" ? 4 : 30;

    const weeklyPercentage = Math.min(Math.round((weeklyCompletedDays / Math.max(1, weeklyExpected)) * 100), 100);
    const monthlyPercentage = Math.min(Math.round((monthlyCompletedDays / Math.max(1, monthlyExpected)) * 100), 100);

    res.json({
      habitId: String(habit._id),
      frequency: habit.frequency,
      streak: {
        current: streak?.currentStreak || 0,
        longest: streak?.longestStreak || 0,
        currentStartDate: streak?.currentStartDate || null,
        currentEndDate: streak?.currentEndDate || null,
        longestStartDate: streak?.longestStartDate || null,
        longestEndDate: streak?.longestEndDate || null,
      },
      weekly: {
        completedDays: weeklyCompletedDays,
        expected: weeklyExpected,
        percentage: weeklyPercentage,
        startDate: start7,
        endDate: now,
      },
      monthly: {
        completedDays: monthlyCompletedDays,
        expected: monthlyExpected,
        percentage: monthlyPercentage,
        startDate: start30,
        endDate: now,
      },
      dailySeries: dailySeries.map((r) => ({ date: r._id, count: r.count })),
      dateToCount: seriesMap,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch habit analytics" });
  }
};

// Get all habits for logged-in user
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user });

    const streaks = await Streak.find({
      userId: req.user,
      habitId: { $in: habits.map((h) => h._id) }
    });

    const streakByHabitId = streaks.reduce((acc, s) => {
      acc[String(s.habitId)] = s;
      return acc;
    }, {});

    const habitsWithStreak = habits.map((h) => {
      const streak = streakByHabitId[String(h._id)];
      return {
        ...h.toObject(),
        streak: streak?.currentStreak || 0
      };
    });

    res.json(habitsWithStreak);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habits" });
  }
};

// Get single habit for logged-in user
exports.getHabitById = async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, userId: req.user });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const streak = await Streak.findOne({ userId: req.user, habitId: habit._id });

    res.json({
      ...habit.toObject(),
      streak: streak?.currentStreak || 0,
      longestStreak: streak?.longestStreak || 0,
      currentStartDate: streak?.currentStartDate || null,
      currentEndDate: streak?.currentEndDate || null,
      longestStartDate: streak?.longestStartDate || null,
      longestEndDate: streak?.longestEndDate || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habit" });
  }
};

// Update habit
exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user },
      req.body,
      { new: true }
    );
    res.json(habit);
  } catch (error) {
    res.status(500).json({ message: "Failed to update habit" });
  }
};

// Delete habit
exports.deleteHabit = async (req, res) => {
  try {
    await Habit.findOneAndDelete({
      _id: req.params.id,
      userId: req.user
    });
    res.json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete habit" });
  }
};
