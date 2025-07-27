const mongoose = require("mongoose");

const EmergencyVisaApplicationSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    nationality: {
      type: String, // e.g., 'IN' for India
      required: true,
    },
    residence: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["tourism", "business", "medical", "funeral", "education", "other"],
      required: true,
    },
    emergencyReason: {
      type: String,
      required: true,
    },
    travelDate: {
      type: Date,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    documents: {
      passport: {
        type: String,
        required: true, // Mandatory document
      },
      invitation: {
        type: String,
      },
      flight: {
        type: String,
      },
      hotel: {
        type: String,
      },
      additional: {
        type: [String], // Array of optional files (URLs/paths)
        default: [],
      },
    },
    status: {
      type: String,
      enum: ["pending", "reviewed", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true, // Auto createdAt, updatedAt
  }
);

module.exports = mongoose.model(
  "EmergencyVisaApplication",
  EmergencyVisaApplicationSchema
);
