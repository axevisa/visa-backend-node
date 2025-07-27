const mongoose = require("mongoose");

const userDocumentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    documentType: {
      type: String,
      required: true, // Required, but not limited to enum
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
    note: {
      type: String,
      default: null,
    },
    updated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const UserDocument = mongoose.model("UserDocument", userDocumentSchema);
module.exports = UserDocument;
