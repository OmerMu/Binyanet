const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    buildingId: { type: String, default: "default-building" },

    title: { type: String, required: true, trim: true },
    body: { type: String, required: true, trim: true },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    createdByName: { type: String, default: "" },
    createdByRole: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Announcement", announcementSchema);
