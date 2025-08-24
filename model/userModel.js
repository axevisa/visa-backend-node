const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: {
      type: String,
      unique: true,
      sparse: true, // allow multiple docs without email
      required: false,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: false,
      unique: true,
      sparse: true, // allow multiple docs without phone
    },
    nationality: { type: String },
    country: { type: String },
    address: { type: String },
    otp: { type: String },
    otpExpiry: { type: Date },
    profilePic: { type: String, default: "" },
    password: {
      type: String,
      required: false, // optional to support Google/OTP users
    },
    // OAuth fields
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    role: { type: String, default: "USER" },
    kycVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;
