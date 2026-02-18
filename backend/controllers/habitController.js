const Habit = require("../models/Habit");

// Create Habit
exports.createHabit = async (req, res) => {
  try {
    const habit = await Habit.create({
      userId: req.user.id,
      name: req.body.title,      // frontend sends title
      frequency: req.body.frequency
    });

    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json({ message: "Failed to create habit" });
  }
};

// Get all habits for logged-in user
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user.id });
    res.json(habits);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch habits" });
  }
};

// Update habit
exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
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
      userId: req.user.id
    });
    res.json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete habit" });
  }
};
