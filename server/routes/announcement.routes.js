const express = require("express");
const router = express.Router();

const Announcement = require("../models/Announcement");
const { protect, authorize } = require("../middleware/authMiddleware");

// ✅ Committee: create announcement
router.post("/committee", protect, authorize("committee"), async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: "title and body are required" });
    }

    const doc = await Announcement.create({
      buildingId: req.user.buildingId || "default-building",
      title: String(title).trim(),
      body: String(body).trim(),
      createdBy: req.user._id,
      createdByName: req.user.fullName || req.user.email,
      createdByRole: req.user.role,
    });

    return res.status(201).json(doc);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to create announcement", error: err.message });
  }
});

// ✅ Committee: list announcements for building
router.get("/committee", protect, authorize("committee"), async (req, res) => {
  try {
    const buildingId = req.user.buildingId || null;
    const filter = buildingId ? { buildingId } : {};

    const rows = await Announcement.find(filter).sort({ createdAt: -1 });
    return res.json(rows);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to load announcements", error: err.message });
  }
});

// ✅ Tenant: list announcements for my building
router.get("/tenant", protect, authorize("tenant"), async (req, res) => {
  try {
    const buildingId = req.user.buildingId || null;
    const filter = buildingId ? { buildingId } : {};

    const rows = await Announcement.find(filter).sort({ createdAt: -1 });
    return res.json(rows);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to load announcements", error: err.message });
  }
});

module.exports = router;
