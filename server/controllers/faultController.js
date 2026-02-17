const mongoose = require("mongoose");
const Fault = require("../models/Fault");

// Tenant creates a fault
exports.createFault = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "נא למלא כותרת ותיאור" });
    }

    // Important: attach buildingId so dashboards can filter correctly
    const buildingId = req.user?.buildingId || "default-building";

    const fault = new Fault({
      title,
      description,
      createdBy: req.user.id,
      buildingId,
    });

    await fault.save();
    res.status(201).json(fault);
  } catch (err) {
    console.error("CREATE FAULT ERROR:", err);
    res.status(500).json({ message: "שגיאה ביצירת תקלה" });
  }
};

// דייר – רואה רק את התקלות שלו
exports.getMyFaults = async (req, res) => {
  try {
    const faults = await Fault.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(faults);
  } catch (err) {
    console.error("GET MY FAULTS ERROR:", err);
    res.status(500).json({ message: "שגיאה בשליפת תקלות" });
  }
};

// אדמין – רואה את כל התקלות
// controllers/faultController.js

// Admin/Committee - get faults (by buildingId)
exports.getAllFaults = async (req, res) => {
  try {
    const role = req.user?.role;

    // Global admin: see everything
    if (role === "admin") {
      const faults = await Fault.find({}).sort({ createdAt: -1 });
      return res.json(faults);
    }

    // Committee: see only its building
    if (role === "committee") {
      const buildingId = req.user?.buildingId;
      if (!buildingId) return res.json([]);
      const faults = await Fault.find({ buildingId }).sort({ createdAt: -1 });
      return res.json(faults);
    }

    return res.status(403).json({ message: "Not allowed" });
  } catch (err) {
    console.error("GET ALL FAULTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// אדמין – שינוי סטטוס תקלה

// אדמין – שינוי סטטוס ו/או הוספת הערת ועד
exports.updateFault = async (req, res) => {
  try {
    const { status, adminNote, historyNote } = req.body;

    const fault = await Fault.findById(req.params.id);
    if (!fault) return res.status(404).json({ message: "Fault not found" });

    // track status change
    if (status && status !== fault.status) {
      fault.history.push({
        text: `סטטוס השתנה ל: ${status}`,
        byUserId: req.user?._id,
        byName: req.user?.name,
      });
      fault.status = status;
    }

    // update admin note (optional)
    if (typeof adminNote === "string" && adminNote !== fault.adminNote) {
      fault.adminNote = adminNote;
    }

    // ✅ add treatment history note
    if (historyNote && String(historyNote).trim()) {
      fault.history.push({
        text: String(historyNote).trim(),
        byUserId: req.user?._id,
        byName: req.user?.name,
      });
    }

    await fault.save();
    res.json({ message: "Fault updated", fault });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error updating fault", error: err.message });
  }
};
