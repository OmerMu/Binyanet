// server/routes/auth.routes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register", authController.register); // הוספת ראוט קבוע להרשמה
const { protect } = require("../middleware/authMiddleware");

router.get("/me", protect, (req, res) => {
  res.json({ id: req.user?._id, email: req.user?.email, role: req.user?.role });
});
module.exports = router;
