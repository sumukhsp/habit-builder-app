const Habit = require("../models/Habit");

// Create Habit
exports.createHabit = async (req, res) => {
  try {
    const habit = await Habit.create({
      userId: req.user,
      title: req.body.title,
      frequency: req.body.frequency
    });
    res.status(201).json(habit);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Get all habits
exports.getHabits = async (req, res) => {
  try {
    const habits = await Habit.find({ userId: req.user });
    res.json(habits);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Update habit
exports.updateHabit = async (req, res) => {
  try {
    const habit = await Habit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(habit);
  } catch (error) {
    res.status(500).json(error.message);
  }
};

// Delete habit
exports.deleteHabit = async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.json({ message: "Habit deleted" });
  } catch (error) {
    res.status(500).json(error.message);
  }
};
