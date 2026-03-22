const mongoose = require("mongoose");
const Lead = require("../models/Lead");

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

exports.createLead = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const phone = String(req.body.phone || "").trim();
    const email = normalizeEmail(req.body.email);
    const buildingSize = String(req.body.buildingSize || "").trim();
    const message = String(req.body.message || "").trim();

    if (!fullName || !phone) {
      return res.status(400).json({ message: "יש למלא שם מלא ומספר טלפון" });
    }

    const lead = await Lead.create({
      fullName,
      phone,
      email,
      buildingSize,
      message,
      status: "new",
    });

    return res.status(201).json({
      message: "הליד נשמר בהצלחה",
      lead,
    });
  } catch (error) {
    console.error("createLead error:", error);
    return res.status(500).json({
      message: "שגיאה בשמירת הליד",
      error: error.message,
    });
  }
};

exports.getLeads = async (req, res) => {
  try {
    const leads = await Lead.find().sort({ createdAt: -1 });
    return res.json(leads);
  } catch (error) {
    console.error("getLeads error:", error);
    return res.status(500).json({
      message: "שגיאה בשליפת הלידים",
      error: error.message,
    });
  }
};

exports.updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const status = String(req.body.status || "").trim();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "מזהה ליד לא תקין" });
    }

    const allowedStatuses = ["new", "contacted", "closed"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "סטטוס לא חוקי" });
    }

    const updatedLead = await Lead.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    );

    if (!updatedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json({
      message: "סטטוס הליד עודכן בהצלחה",
      lead: updatedLead,
    });
  } catch (error) {
    console.error("updateLeadStatus error:", error);
    return res.status(500).json({
      message: "שגיאה בעדכון סטטוס הליד",
      error: error.message,
    });
  }
};

exports.deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "מזהה ליד לא תקין" });
    }

    const deletedLead = await Lead.findByIdAndDelete(id);

    if (!deletedLead) {
      return res.status(404).json({ message: "Lead not found" });
    }

    return res.json({ message: "הליד נמחק בהצלחה" });
  } catch (error) {
    console.error("deleteLead error:", error);
    return res.status(500).json({
      message: "שגיאה במחיקת ליד",
      error: error.message,
    });
  }
};
