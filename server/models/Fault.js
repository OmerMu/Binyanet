const mongoose = require("mongoose");

const faultSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    adminNote: {
      type: String,
      default: "",
      trim: true,
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buildingId: {
      type: String,
      default: "default-building",
      // בהמשך נחליף לזהות בניין אמיתית
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fault", faultSchema);
