const mongoose = require("mongoose");

const passportApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Basic Applicant Info
    fullName: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced"],
      required: true,
    },
    nationality: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    address: { type: String },

    // Passport Type
    applicationType: {
      type: String,
      enum: ["Fresh", "Re-issue", "Lost/Damaged"],
      required: true,
    },

    // Documents
    documents: {
      aadharCard: { type: String, required: true },
      dobProof: { type: String, required: true },
      identityProof: { type: String, required: true },
      passportPhotos: [{ type: String, required: true }],

      // Optional / Conditional
      employmentProof: { type: String },
      annexures: [{ type: String }],
      oldPassport: { type: String },
      policeVerificationProof: { type: String },
    },

    // Admin Processing Fields
    assignedExpert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin", // role: "EXPERT"
      default: null,
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    processingDeadline: { type: Date }, // Admin can set

    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "COMPLETED", "REJECTED"],
      default: "PENDING",
    },
    rejectionReason: { type: String }, // Only if status is REJECTED

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PassportApplication",
  passportApplicationSchema
);
