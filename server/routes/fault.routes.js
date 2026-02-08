const express = require("express");
const router = express.Router();
const {
  createFault,
  getMyFaults,
  getAllFaults,
  updateFault,
} = require("../controllers/faultController");

const { protect, requireAdmin } = require("../middleware/authMiddleware");

// דייר
router.post("/", protect, createFault);
router.get("/my", protect, getMyFaults);

// אדמין
router.get("/", protect, requireAdmin, getAllFaults);
router.patch("/:id", protect, requireAdmin, updateFault);

module.exports = router;
