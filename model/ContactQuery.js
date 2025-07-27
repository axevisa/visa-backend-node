// models/ContactQuery.js

const mongoose = require("mongoose");

const ContactQuerySchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/.+@.+\..+/, "Invalid email address"],
    },
    phone: {
      type: String,
      trim: true,
    },
    serviceType: {
      type: String,
      enum: ["Visa", "Immigration", "Consultation", "Other"],
      default: "Other",
    },
    message: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

module.exports = mongoose.model("ContactQuery", ContactQuerySchema);
