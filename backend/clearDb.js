const mongoose = require("mongoose");
require("dotenv").config();

const clearCollections = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  const db = mongoose.connection.db;

  await db.collection("completionlogs").deleteMany({});
  await db.collection("streaks").deleteMany({});
  await db.collection("habits").deleteMany({});
  await db.collection("users").deleteMany({});

  console.log("All collections cleared.");
  await mongoose.connection.close();
};

clearCollections().catch(console.error);