const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "EXPERT"],
    },
    country: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);
const Admin = mongoose.model("Admin", adminSchema);
module.exports = Admin;
