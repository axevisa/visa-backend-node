const mongoose = require("mongoose");
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    visaApplication: {
      type: Schema.Types.ObjectId,
      ref: "VisaApplication",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    message: {
      type: String,
    },

    to: {
      type: String,
      enum: ["user", "admin"],
      required: true,
    },

    status: {
      type: String,
      enum: ["unread", "read"],
      default: "unread",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Notification", notificationSchema);
