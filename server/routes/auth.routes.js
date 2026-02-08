// server/routes/auth.routes.js

const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register", authController.register); // הוספת ראוט קבוע להרשמה

module.exports = router;
