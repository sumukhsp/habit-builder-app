const Habit = require("../models/Habit");
const Streak = require("../models/Streak");

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
