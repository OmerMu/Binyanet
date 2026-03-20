const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    buildingId: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    senderName: {
      type: String,
      required: true,
      trim: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Message", messageSchema);
