const express = require("express");
const router = express.Router();

const Message = require("../models/Message");
const { protect, authorize } = require("../middleware/authMiddleware");

// דייר / ועד - שליחת הודעה לצ'אט של הבניין
router.post(
  "/",
  protect,
  authorize("tenant", "committee"),
  async (req, res) => {
    try {
      const { text } = req.body;

      if (!text || !String(text).trim()) {
        return res.status(400).json({ message: "text is required" });
      }

      const message = await Message.create({
        buildingId: req.user.buildingId ?? null,
        senderId: req.user._id,
        senderName: req.user.fullName || req.user.email,
        text: String(text).trim(),
      });

      return res.status(201).json(message);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to create message", error: err.message });
    }
  },
);

// דייר / ועד - שליפת הודעות של הבניין
router.get(
  "/building",
  protect,
  authorize("tenant", "committee"),
  async (req, res) => {
    try {
      const buildingId = req.user.buildingId ?? null;

      const rows = await Message.find({ buildingId })
        .sort({ createdAt: 1 })
        .limit(100);

      return res.json(rows);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to load messages", error: err.message });
    }
  },
);

module.exports = router;
