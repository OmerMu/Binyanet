const mongoose = require("mongoose");
const User = require("../models/User");
const { sendApprovalEmail } = require("../utils/emailService");
const allowedRoles = ["admin", "company", "committee", "tenant"];

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה בשליפת משתמשים" });
  }
};

exports.listPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ isApproved: false })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה בשליפת משתמשים ממתינים" });
  }
};

exports.createUser = async (req, res) => {
  try {
    const fullName = String(req.body.fullName || "").trim();
    const email = normalizeEmail(req.body.email);
    const phone = String(req.body.phone || "").trim();
    const password = String(req.body.password || "");
    const role = String(req.body.role || "tenant");
    const buildingId = req.body.buildingId || null;
    const isApproved =
      req.body.isApproved === undefined ? true : Boolean(req.body.isApproved);

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "נא למלא שם מלא, אימייל וסיסמה" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role לא חוקי" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "אימייל כבר קיים במערכת" });
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role,
      requestedRole: role,
      isApproved,
      buildingId,
    });

    return res.status(201).json({
      message: "המשתמש נוצר בהצלחה",
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        requestedRole: user.requestedRole,
        isApproved: user.isApproved,
        buildingId: user.buildingId,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה ביצירת משתמש" });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "מזהה לא תקין" });
    }

    const role = req.body.role ? String(req.body.role) : undefined;
    const update = { isApproved: true };

    if (role) {
      if (!allowedRoles.includes(role)) {
        return res.status(400).json({ message: "Role לא חוקי" });
      }
      update.role = role;
      update.requestedRole = role;
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await sendApprovalEmail(user);

    return res.json({
      message: "המשתמש אושר בהצלחה",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה באישור משתמש" });
  }
};

exports.rejectUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "מזהה לא תקין" });
    }

    const deleted = await User.findByIdAndDelete(id).select("-password");

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "המשתמש נדחה ונמחק" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה בדחיית משתמש" });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = String(req.body.role || "");

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "מזהה לא תקין" });
    }

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Role לא חוקי" });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { role, requestedRole: role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "התפקיד עודכן בהצלחה",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה בעדכון role" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role, isApproved, buildingId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "מזהה לא תקין" });
    }

    const update = {};

    if (fullName !== undefined) update.fullName = String(fullName).trim();
    if (email !== undefined) update.email = normalizeEmail(email);
    if (phone !== undefined) update.phone = String(phone).trim();
    if (buildingId !== undefined) update.buildingId = buildingId || null;
    if (isApproved !== undefined) update.isApproved = Boolean(isApproved);

    if (role !== undefined) {
      if (!allowedRoles.includes(String(role))) {
        return res.status(400).json({ message: "Role לא חוקי" });
      }
      update.role = String(role);
      update.requestedRole = String(role);
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select(
      "-password",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      message: "פרטי המשתמש עודכנו בהצלחה",
      user,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה בעדכון משתמש" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "מזהה לא תקין" });
    }

    if (String(req.user._id) === String(id)) {
      return res
        .status(400)
        .json({ message: "לא ניתן למחוק את המשתמש המחובר" });
    }

    const deleted = await User.findByIdAndDelete(id).select("-password");

    if (!deleted) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "המשתמש נמחק בהצלחה" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "שגיאה במחיקת משתמש" });
  }
};
