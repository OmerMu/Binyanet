const express = require("express");
const router = express.Router();

const {
  getAllFaults,
  getMyFaults,
  getCommitteeFaults,
  createFault,
  updateFault,
} = require("../controllers/faultController");

const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/", protect, authorize("admin"), getAllFaults);
router.get("/my", protect, authorize("tenant"), getMyFaults);
router.get("/committee", protect, authorize("committee"), getCommitteeFaults);
router.post("/", protect, authorize("tenant"), createFault);
router.patch("/:id", protect, authorize("admin", "committee"), updateFault);

module.exports = router;
