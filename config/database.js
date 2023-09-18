const mongoose = require("mongoose");

const databaseConnection = async (callback) => {
  try {
    if (process.env.DATABASE_URL) {
      const clientConnected = await mongoose.connect(process.env.DATABASE_URL);
      if (clientConnected) {
        console.log("Database connected successfully");
        callback();
      } else {
        console.log("Database connection failed");
      }
    } else {
      console.log("Database URL is not provided");
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = databaseConnection;
