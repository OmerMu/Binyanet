const mongoose = require("mongoose");

const FaultHistorySchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    byUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    byName: { type: String },
  },
  { timestamps: true },
);

const FaultSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "closed"],
      default: "open",
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    committeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminNote: { type: String, default: "" },

    // ✅ חדש
    history: { type: [FaultHistorySchema], default: [] },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Fault", FaultSchema);
