const express = require("express");
const router = express.Router();

const {
  createLead,
  getLeads,
  updateLeadStatus,
  deleteLead,
} = require("../controllers/leadController");

const { protect, authorize } = require("../middleware/authMiddleware");

// יצירת ליד - ציבורי
router.post("/", createLead);

// שליפת כל הלידים - רק אדמין
router.get("/", protect, authorize("admin"), getLeads);

// עדכון סטטוס ליד - רק אדמין
router.patch("/:id/status", protect, authorize("admin"), updateLeadStatus);

// מחיקת ליד - רק אדמין
router.delete("/:id", protect, authorize("admin"), deleteLead);

module.exports = router;
