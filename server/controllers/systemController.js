const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");

const allowedRoles = ["admin", "company", "committee", "tenant"];

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ email: 1 });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה בשליפת משתמשים" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const role = String(req.body.role || "tenant");

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role לא חוקי" });
    }

    if (!email || !password) {
      return res.status(400).json({ message: "נא להזין אימייל וסיסמה" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "אימייל כבר קיים" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashed,
      role,
      fullName: "System User",
      isApproved: true,
    });

    return res.status(201).json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה ביצירת משתמש" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = String(req.body.role);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "מזהה לא תקין" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role לא חוקי" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true },
    ).select("-password");

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה בעדכון role" });
  }
};
exports.listPendingUsers = async (req, res) => {
  const users = await User.find({ isApproved: false })
    .select("-password")
    .sort({ createdAt: -1 });
  return res.json(users);
};

exports.approveUser = async (req, res) => {
  const { id } = req.params;
  const isApproved = Boolean(req.body.isApproved);
  const role = req.body.role ? String(req.body.role) : undefined;

  const update = { isApproved };

  if (role) {
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role לא חוקי" });
    }
    update.role = role;
  }

  const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
    "-password",
  );
  return res.json(user);
};
exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;
    const isApproved = Boolean(req.body.isApproved);

    const user = await User.findByIdAndUpdate(
      id,
      { isApproved },
      { new: true },
    ).select("-password");

    return res.json(user);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה באישור משתמש" });
  }
};
