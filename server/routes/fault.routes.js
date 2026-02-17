const express = require("express");
const router = express.Router();

const {
  createFault,
  getMyFaults,
  getAllFaults,
  updateFault,
} = require("../controllers/faultController");

const { protect, authorize } = require("../middleware/authMiddleware");

// tenant – פותח תקלה ורואה רק שלו

router.post("/", protect, authorize("tenant"), createFault);
router.get("/my", protect, authorize("tenant"), getMyFaults);

// committee/admin – רואים הכל ומעדכנים
router.get("/", protect, authorize("admin", "committee"), getAllFaults);
router.get("/", protect, authorize("admin", "committee"), getAllFaults);
router.patch("/:id", protect, authorize("admin", "committee"), updateFault);

module.exports = router;
