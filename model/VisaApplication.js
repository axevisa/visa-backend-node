const mongoose = require("mongoose");

const visaApplicationSchema = new mongoose.Schema(
  {
    applicationId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDraft: {
      type: Boolean,
      default: true,
    },
    fullName: {
      type: String,
      required: function () {
        return !this.isDraft;
      },
    },
    dob: {
      type: Date,
      required: function () {
        return !this.isDraft;
      },
    },
    nationality: {
      type: String,
      required: function () {
        return !this.isDraft;
      },
    },
    passportNumber: {
      type: String,
      required: function () {
        return !this.isDraft;
      },
    },
    passportIssueDate: {
      type: Date,
      required: function () {
        return !this.isDraft;
      },
    },
    passportExpiryDate: {
      type: Date,
      required: function () {
        return !this.isDraft;
      },
    },
    destinationCountry: {
      type: String,
      required: true,
    },
    travelPurpose: {
      type: String,
      enum: ["Tourism", "Business", "Study", "Medical", "Transit", "Other"],
      default: "Tourism",
    },
    travelDate: {
      type: Date,
      required: function () {
        return !this.isDraft;
      },
    },
    travelDurationInDays: {
      type: Number,
      required: function () {
        return !this.isDraft;
      },
    },
    email: {
      type: String,
      required: function () {
        return !this.isDraft;
      },
    },
    phone: {
      type: String,
      required: function () {
        return !this.isDraft;
      },
    },
    address: {
      type: String,
      required: function () {
        return !this.isDraft;
      },
    },
    employmentStatus: {
      type: String,
      enum: [
        "Working",
        "Business",
        "Student",
        "Unemployed",
        "Retired",
        "Other",
      ],
      required: function () {
        return !this.isDraft;
      },
    },
    applicationStatus: {
      type: String,
      enum: [
        "Pending",
        "Under Review",
        "Documents Required",
        "Appointment Scheduled",
        "Case Prepared",
        "Visa Approved",
        "Visa Rejected",
        "Dispatched / Passport Sent",
        "On Hold",
        "Withdrawn by Applicant",
        "Complete",
        "Cancelled",
      ],
      default: "Pending",
    },
    expert: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "low",
    },
    assignedAt: {
      type: Date,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },
    checklist: [
      {
        note: {
          type: String,
          required: true,
        },
        subnote: {
          type: String,
          default: null,
        },
        file: {
          type: String,
          default: null,
        },
        accepted: {
          type: String,
          enum: ["Accepted", "Rejected", "Pending"],
          default: "Pending",
        },
        remarks: {
          type: String,
          default: null,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("VisaApplication", visaApplicationSchema);
