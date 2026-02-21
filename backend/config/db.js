const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error("Missing MONGO_URI environment variable");
    }

    if (!uri.startsWith("mongodb+srv://") && !uri.startsWith("mongodb://")) {
      throw new Error("Invalid MONGO_URI format. Expected mongodb+srv:// or mongodb://");
    }

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err?.message || err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error?.message || error);
    process.exit(1);
  }
};

module.exports = connectDB;
