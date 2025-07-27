const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order_id: {
      type: String,
      required: true,
    },
    payment_id: {
      type: String,
      required: true,
    },
    product_id: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type_of_payment: {
      type: String,
      enum: ["visa", "passport", "other"],
      required: true,
    },
    package_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PackagePricing",
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
  }
);

module.exports = mongoose.model("Payment", paymentSchema);
