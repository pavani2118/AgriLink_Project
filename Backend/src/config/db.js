const mongoose = require("mongoose");

const connectDB = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB Connected ✅", process.env.MONGO_URI);
  console.log("DB Name ✅ =", conn.connection.name);
};

module.exports = connectDB;
