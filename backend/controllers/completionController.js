const CompletionLog = require("../models/CompletionLog");
const Streak = require("../models/Streak");
const Habit = require("../models/Habit");

exports.markComplete = async (req, res) => {
  try {
    const { habitId } = req.body;
    const userId = req.user.id;

    if (!habitId) {
      return res.status(400).json({ message: "Habit ID is required" });
    }

    // check habit ownership
    const habit = await Habit.findOne({ _id: habitId, userId });
    if (!habit) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const today = new Date();
    today.setHours(0,0,0,0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // prevent duplicate completion today
    const existingCompletion = await CompletionLog.findOne({
      habitId,
      userId,
      date: { $gte: today, $lt: tomorrow },
    });

    if (existingCompletion) {
      return res.status(409).json({ message: "Already completed today" });
    }

    // create completion
    const completion = await CompletionLog.create({
      habitId,
      userId,
      date: new Date(),
    });

    // ---- STREAK LOGIC FIX ----
    let streak = await Streak.findOne({ habitId, userId });

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const yesterdayCompletion = await CompletionLog.findOne({
      habitId,
      userId,
      date: { $gte: yesterday, $lt: today },
    });

    if (!streak) {
      streak = await Streak.create({
        habitId,
        userId,
        currentStreak: 1,
        longestStreak: 1
      });
    } else {
      if (yesterdayCompletion) {
        // continue streak
        streak.currentStreak += 1;
      } else {
        // reset streak
        streak.currentStreak = 1;
      }

      if (streak.currentStreak > streak.longestStreak) {
        streak.longestStreak = streak.currentStreak;
      }

      await streak.save();
    }

    res.json({
      message: "Habit marked complete",
      completion,
      streak
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to mark habit complete" });
  }
};
