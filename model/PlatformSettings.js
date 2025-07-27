const mongoose = require("mongoose");

const platformSettingsSchema = new mongoose.Schema(
  {
    visaFee: {
      type: Number,
      required: true,
      default: 0,
    },
    platformFee: {
      type: Number,
      required: true,
      default: 0,
    },
    paymentGatewayFee: {
      type: Number,
      required: true,
      default: 0,
    },
    gstPercent: {
      type: Number,
      required: true,
      default: 18,
    },
    currency: {
      type: String,
      default: "INR",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PlatformSettings", platformSettingsSchema);
