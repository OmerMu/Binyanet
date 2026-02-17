const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ["admin", "company", "committee", "tenant"],
      default: "tenant",
    },

    buildingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Building",
      default: null,
    },

    isApproved: {
      type: Boolean,
      default: false,
    },
    requestedRole: {
      type: String,
      enum: ["admin", "company", "committee", "tenant"],
      default: "tenant",
    },
  },

  { timestamps: true },
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
