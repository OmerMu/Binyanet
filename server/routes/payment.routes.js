const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");
const { protect, authorize } = require("../middleware/authMiddleware");

// ✅ Tenant creates a payment (for demo / future integration)
router.post("/", protect, authorize("tenant"), async (req, res) => {
  try {
    const { amount, city, monthKey } = req.body;

    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: "amount is required" });
    }
    if (!monthKey) {
      return res
        .status(400)
        .json({ message: "monthKey is required (e.g. 2026-02)" });
    }

    const payment = await Payment.create({
      tenantId: req.user._id,
      buildingId: req.user.buildingId || "default-building",
      city: (city || "לא ידוע").trim(),
      amount: Number(amount),
      monthKey: String(monthKey).trim(),
      status: "paid",
    });

    return res.status(201).json(payment);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Payment failed", error: err.message });
  }
});

// ✅ Tenant: view my payments
router.get("/my", protect, authorize("tenant"), async (req, res) => {
  try {
    const rows = await Payment.find({ tenantId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(rows);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to load payments", error: err.message });
  }
});

// ✅ Committee: payments history for building
router.get("/committee", protect, authorize("committee"), async (req, res) => {
  try {
    const buildingId = req.user.buildingId || null;
    const filter = buildingId ? { buildingId } : {}; // אם אין buildingId - מחזיר הכל (לבדיקות)

    const rows = await Payment.find(filter)
      .populate("tenantId", "fullName email")
      .sort({ createdAt: -1 });

    return res.json(rows);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to load payments", error: err.message });
  }
});

module.exports = router;
