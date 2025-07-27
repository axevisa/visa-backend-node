const mongoose = require("mongoose");

const packagePricingSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    offerPrice: {
      type: Number,
      default: null, // optional field
    },
    points: {
      type: [String], // array of strings like ["Free support", "Lifetime updates"]
      default: [],
    },
    notes: {
      type: String,
      default: null, // optional field
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("PackagePricing", packagePricingSchema);

// const PackagePricing = mongoose.model("PackagePricing", packagePricingSchema);

// export default PackagePricing;
