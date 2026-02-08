const mongoose = require("mongoose");
const Fault = require("../models/Fault");

// דייר פותח תקלה
exports.createFault = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "נא למלא כותרת ותיאור" });
    }

    const fault = new Fault({
      title,
      description,
      createdBy: req.user.id,
    });

    await fault.save();
    res.status(201).json(fault);
  } catch (err) {
    console.error("CREATE FAULT ERROR:", err);
    res.status(500).json({ message: "שגיאה ביצירת תקלה" });
  }
};

// דייר – רואה רק את התקלות שלו
exports.getMyFaults = async (req, res) => {
  try {
    const faults = await Fault.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });
    res.json(faults);
  } catch (err) {
    console.error("GET MY FAULTS ERROR:", err);
    res.status(500).json({ message: "שגיאה בשליפת תקלות" });
  }
};

// אדמין – רואה את כל התקלות
exports.getAllFaults = async (req, res) => {
  try {
    const faults = await Fault.find()
      .populate("createdBy", "email role")
      .sort({ createdAt: -1 });
    res.json(faults);
  } catch (err) {
    console.error("GET ALL FAULTS ERROR:", err);
    res.status(500).json({ message: "שגיאה בשליפת כל התקלות" });
  }
};

// אדמין – שינוי סטטוס תקלה

// אדמין – שינוי סטטוס ו/או הוספת הערת ועד
exports.updateFault = async (req, res) => {
  try {
    const { status, adminNote } = req.body;

    // 1) בדיקת id תקין (מונע CastError)
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "מזהה תקלה לא תקין" });
    }

    const update = {};

    // 2) סטטוס (אופציונלי)
    if (status !== undefined) {
      const allowed = ["open", "in_progress", "closed"];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: "סטטוס לא חוקי" });
      }
      update.status = status;
    }

    // 3) הערת ועד (אופציונלי)
    if (adminNote !== undefined) {
      update.adminNote = String(adminNote);
    }

    // 4) אם לא נשלח שום דבר לעדכון
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: "לא נשלחו שדות לעדכון" });
    }

    const fault = await Fault.findByIdAndUpdate(id, update, { new: true });

    if (!fault) {
      return res.status(404).json({ message: "תקלה לא נמצאה" });
    }

    return res.json(fault);
  } catch (err) {
    console.error("UPDATE FAULT ERROR:", err);
    return res.status(500).json({
      message: "שגיאה בעדכון תקלה",
      error: err.message, // ✅ בפיתוח זה יעזור לך לראות מה נשבר
    });
  }
};
