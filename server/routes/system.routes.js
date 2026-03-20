const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/authMiddleware");
const systemController = require("../controllers/systemController");

// שליפת כל המשתמשים
router.get("/users", protect, authorize("admin"), systemController.listUsers);

// שליפת משתמשים ממתינים לאישור
router.get(
  "/pending-users",
  protect,
  authorize("admin"),
  systemController.listPendingUsers,
);

// יצירת משתמש חדש מתוך המערכת
router.post("/users", protect, authorize("admin"), systemController.createUser);

// אישור משתמש + אפשרות לעדכן לו role
router.patch(
  "/approve-user/:id",
  protect,
  authorize("admin"),
  systemController.approveUser,
);

// שינוי role למשתמש קיים
router.patch(
  "/users/:id/role",
  protect,
  authorize("admin"),
  systemController.updateUserRole,
);

// עדכון משתמש מלא
router.put(
  "/users/:id",
  protect,
  authorize("admin"),
  systemController.updateUser,
);

// מחיקת משתמש
router.delete(
  "/users/:id",
  protect,
  authorize("admin"),
  systemController.deleteUser,
);

// דחיית משתמש ממתין
router.delete(
  "/reject-user/:id",
  protect,
  authorize("admin"),
  systemController.rejectUser,
);

module.exports = router;
