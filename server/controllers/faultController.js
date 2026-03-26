const Fault = require("../models/Fault");
const { sendFaultCreatedEmail } = require("../utils/emailService");

exports.createFault = async (req, res) => {
  try {
    const { title, description, imageUrl, imagePublicId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "נא למלא כותרת ותיאור" });
    }

    const fault = new Fault({
      title,
      description,
      tenantId: req.user._id,
      buildingId: req.user?.buildingId ?? null,
      imageUrl: String(imageUrl || "").trim(),
      imagePublicId: String(imagePublicId || "").trim(),
    });

    await fault.save();
    await sendFaultCreatedEmail(req.user, fault);

    return res.status(201).json(fault);
  } catch (err) {
    console.error("CREATE FAULT ERROR:", err);
    return res.status(500).json({ message: "שגיאה ביצירת תקלה" });
  }
};

exports.getMyFaults = async (req, res) => {
  try {
    const faults = await Fault.find({ tenantId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(faults);
  } catch (err) {
    console.error("GET MY FAULTS ERROR:", err);
    return res.status(500).json({ message: "שגיאה בשליפת תקלות" });
  }
};

exports.getAllFaults = async (req, res) => {
  try {
    const role = req.user?.role;

    if (role === "admin") {
      const faults = await Fault.find({}).sort({ createdAt: -1 });
      return res.json(faults);
    }

    if (role === "committee") {
      const buildingId = req.user?.buildingId;
      if (!buildingId) return res.json([]);
      const faults = await Fault.find({ buildingId }).sort({ createdAt: -1 });
      return res.json(faults);
    }

    return res.status(403).json({ message: "Not allowed" });
  } catch (err) {
    console.error("GET ALL FAULTS ERROR:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.updateFault = async (req, res) => {
  try {
    const { status, adminNote, historyNote } = req.body;

    const fault = await Fault.findById(req.params.id);
    if (!fault) return res.status(404).json({ message: "Fault not found" });

    if (status && status !== fault.status) {
      fault.history.push({
        text: `סטטוס השתנה ל: ${status}`,
        byUserId: req.user?._id,
        byName: req.user?.fullName,
      });
      fault.status = status;
    }

    if (typeof adminNote === "string" && adminNote !== fault.adminNote) {
      fault.adminNote = adminNote;
    }

    if (historyNote && String(historyNote).trim()) {
      fault.history.push({
        text: String(historyNote).trim(),
        byUserId: req.user?._id,
        byName: req.user?.fullName,
      });
    }

    await fault.save();
    return res.json(fault);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error updating fault", error: err.message });
  }
};

exports.getCommitteeFaults = async (req, res) => {
  try {
    const buildingId = req.user?.buildingId ?? null;
    const filter = buildingId ? { buildingId } : {};
    const faults = await Fault.find(filter).sort({ createdAt: -1 });
    return res.json(faults);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load faults" });
  }
};
