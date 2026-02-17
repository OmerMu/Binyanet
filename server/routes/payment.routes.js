const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const { authenticate, authorize } = require("../middleware/authMiddleware");

router.post("/", authenticate, authorize("tenant"), async (req, res) => {
  try {
    const { building, city, amount, month } = req.body;

    const payment = await Payment.create({
      tenant: req.user.id,
      building,
      city,
      amount,
      month,
    });

    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: "Payment failed" });
  }
});

module.exports = router;
