const mongoose = require("mongoose");
require("dotenv").config();

const connectToDb = () => {
  mongoose.connect(process.env.MONGO_URL).then(async () => {
    console.log("Database connected");
    // Ensure indexes are in sync (important after schema changes like sparse/unique)
    try {
      const User = require("../model/userModel");
      await User.syncIndexes();
    } catch (e) {
      console.warn("Index sync warning:", e.message);
    }
  });
};

module.exports = connectToDb;
