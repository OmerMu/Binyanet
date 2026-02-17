const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const analyticsController = require("../controllers/analyticsController");

// middleware קטן לתפקידים (כי אצלך authMiddleware לא תמיד כולל authorize)
function requireRole(...roles) {
  return (req, res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: "אין הרשאה" });
    }
    next();
  };
}

router.get(
  "/summary",
  protect,
  requireRole("company", "admin"),
  analyticsController.getSummary,
);
router.get(
  "/company",
  protect,
  requireRole("company", "admin"),
  analyticsController.getCompanyDashboard,
);

module.exports = router;
