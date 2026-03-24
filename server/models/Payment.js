const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    buildingId: { type: String, default: "default-building" },

    city: { type: String, default: "לא ידוע", trim: true },

    amount: { type: Number, required: true, min: 0 },

    monthKey: { type: String, required: true },

    provider: {
      type: String,
      enum: ["bit", "paypal", "applepay", "googlepay", "credit"],
      default: "credit",
    },

    externalPaymentId: {
      type: String,
      default: null,
    },

    approvalUrl: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["pending", "paid", "refunded", "failed", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
