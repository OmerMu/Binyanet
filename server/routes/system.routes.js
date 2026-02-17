const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, authorize } = require("../middleware/authMiddleware");

// יצירת משתמשים ע"י סופר אדמין (מה שכבר היה לך)
router.post(
  "/create-user",
  protect,
  authorize("super_admin"),
  async (req, res) => {
    try {
      const { name, email, password, role, isApproved = true } = req.body;
      const user = await User.create({
        name,
        email,
        password,
        role,
        isApproved,
      });
      res.status(201).json({ message: "User created", user });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error creating user", error: err.message });
    }
  },
);

router.get(
  "/get-users",
  protect,
  authorize("super_admin"),
  async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.json(users);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching users", error: err.message });
    }
  },
);

router.delete(
  "/delete-user/:id",
  protect,
  authorize("super_admin"),
  async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: "User deleted" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error deleting user", error: err.message });
    }
  },
);

router.put(
  "/update-user/:id",
  protect,
  authorize("super_admin"),
  async (req, res) => {
    try {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true },
      ).select("-password");
      res.json({ message: "User updated", user: updatedUser });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating user", error: err.message });
    }
  },
);

/**
 * ✅ חדש: בקשות הרשמה ממתינות (admin / super_admin)
 */
router.get(
  "/pending-users",
  protect,
  authorize("admin", "super_admin"),
  async (req, res) => {
    try {
      const pending = await User.find({ isApproved: false }).select(
        "-password",
      );
      res.json(pending);
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching pending users", error: err.message });
    }
  },
);

router.patch(
  "/approve-user/:id",
  protect,
  authorize("admin", "super_admin"),
  async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        { isApproved: true },
        { new: true },
      ).select("-password");

      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User approved", user });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error approving user", error: err.message });
    }
  },
);

router.delete(
  "/reject-user/:id",
  protect,
  authorize("admin", "super_admin"),
  async (req, res) => {
    try {
      const deleted = await User.findByIdAndDelete(req.params.id).select(
        "-password",
      );
      if (!deleted) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User rejected and deleted" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error rejecting user", error: err.message });
    }
  },
);

module.exports = router;
