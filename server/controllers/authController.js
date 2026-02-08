const axios = require("axios");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// ⚠️ אם אתה כבר עושה dotenv ב-server.js, לא חייב פה.
// אבל זה לא מזיק, רק חשוב שזה יקרה לפני שימוש ב-process.env
require("dotenv").config();

// Helpers
function isProduction() {
  return process.env.NODE_ENV === "production";
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const captchaToken = String(req.body.captchaToken || "");

    // ולידציה בסיסית
    if (!email || !password) {
      return res.status(400).json({ message: "נא להזין אימייל וסיסמה" });
    }

    // ✅ reCAPTCHA רק בפרודקשן
    if (isProduction()) {
      if (!captchaToken) {
        return res.status(400).json({ message: "reCAPTCHA חסר" });
      }

      if (!process.env.RECAPTCHA_SECRET) {
        return res.status(500).json({ message: "חסר RECAPTCHA_SECRET בשרת" });
      }

      try {
        const response = await axios.post(
          "https://www.google.com/recaptcha/api/siteverify",
          null,
          {
            params: {
              secret: process.env.RECAPTCHA_SECRET,
              response: captchaToken,
            },
          }
        );

        if (!response?.data?.success) {
          return res.status(403).json({ message: "reCAPTCHA נכשל" });
        }
      } catch (err) {
        console.error("reCAPTCHA error:", err?.response?.data || err.message);
        return res.status(500).json({ message: "שגיאה באימות reCAPTCHA" });
      }
    } else {
      // DEV mode
      console.log("DEV: skipping reCAPTCHA validation");
    }

    // בדיקת משתמש
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "משתמש לא נמצא" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "סיסמה שגויה" });

    // JWT secret חובה
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing in environment variables");
      return res.status(500).json({ message: "חסר JWT_SECRET בשרת" });
    }

    // יצירת טוקן
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "שגיאת שרת בהתחברות" });
  }
};

exports.register = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const role = String(req.body.role || "user");

    if (!email || !password) {
      return res.status(400).json({ message: "נא להזין אימייל וסיסמה" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "הסיסמה חייבת להכיל לפחות 6 תווים" });
    }

    // ✅ הגנה: מאפשרים רק roles מוכרים (בהמשך אפשר להרחיב)
    const allowedRoles = ["admin", "user"];
    const safeRole = allowedRoles.includes(role) ? role : "user";

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "אימייל כבר קיים" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role: safeRole,
    });

    await newUser.save();

    return res.status(201).json({
      message: "המשתמש נוצר בהצלחה",
      user: { email: newUser.email, role: newUser.role },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "שגיאת שרת בהרשמה" });
  }
};
