const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // כרגע פשוט: משתמשים ב-buildingId שיש אצלך ב-Fault (String).
    // בהמשך נעשה Building מודל אמיתי.
    buildingId: { type: String, default: "default-building" },

    city: { type: String, default: "לא ידוע", trim: true },

    amount: { type: Number, required: true, min: 0 },

    // לדוגמה "2026-02" כדי לדעת שזה תשלום חודש פברואר 2026
    monthKey: { type: String, required: true },

    status: {
      type: String,
      enum: ["paid", "refunded"],
      default: "paid",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Payment", paymentSchema);
