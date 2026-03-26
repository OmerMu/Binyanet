const express = require("express");
const router = express.Router();

const {
  createLead,
  getLeads,
  updateLeadStatus,
} = require("../controllers/leadController");

const { protect, authorize } = require("../middleware/authMiddleware");

// יצירת ליד - ציבורי
router.post("/", createLead);

// שליפת כל הלידים - רק אדמין
router.get("/", protect, authorize("admin"), getLeads);

// עדכון סטטוס ליד - רק אדמין
router.patch("/:id/status", protect, authorize("admin"), updateLeadStatus);

module.exports = router;
