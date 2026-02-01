const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },

    role: { type: String, enum: ["buyer", "vendor"], default: "buyer" },
    district: { type: String, default: "" },
    shopName: { type: String, default: "" },

    profileImage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
