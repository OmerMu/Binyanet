const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const {
  sendPendingApprovalEmail,
  sendPasswordResetEmail,
} = require("../utils/emailService");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

async function verifyRecaptcha(recaptchaToken, reqIp) {
  if (!process.env.RECAPTCHA_SECRET_KEY) return { ok: true, skipped: true };

  if (!recaptchaToken) return { ok: false, reason: "Missing recaptcha token" };

  const params = new URLSearchParams();
  params.append("secret", process.env.RECAPTCHA_SECRET_KEY);
  params.append("response", recaptchaToken);
  if (reqIp) params.append("remoteip", reqIp);

  const resp = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });

  const data = await resp.json();

  if (!data?.success) return { ok: false, reason: "Recaptcha failed", data };
  return { ok: true, data };
}

exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password, requestedRole } = req.body;

    const allowedRequestedRoles = ["tenant", "committee", "company"];
    const safeRequestedRole = allowedRequestedRoles.includes(
      String(requestedRole),
    )
      ? String(requestedRole)
      : "tenant";

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      role: "tenant",
      requestedRole: safeRequestedRole,
      isApproved: false,
    });

    await sendPendingApprovalEmail(user);

    return res.status(201).json({
      message: "Registration successful. Waiting for admin approval.",
      userId: user._id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password, recaptchaToken } = req.body;
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    const ip =
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      req.socket?.remoteAddress;

    const captcha = await verifyRecaptcha(recaptchaToken, ip);
    if (!captcha.ok) {
      return res.status(400).json({ message: "reCAPTCHA verification failed" });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isApproved) {
      return res.status(403).json({
        message: "User not approved yet. Please wait for admin approval.",
      });
    }

    const token = generateToken(user._id, user.role);

    return res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Login failed", error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: String(email || "")
        .trim()
        .toLowerCase(),
    });

    if (!user) {
      return res.status(200).json({ message: "אם המייל קיים נשלח קישור" });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;

    await user.save();
    await sendPasswordResetEmail(user, resetToken);

    return res.json({ message: "נשלח קישור לאיפוס סיסמה" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "טוקן לא תקף או פג תוקף" });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.json({ message: "סיסמה עודכנה בהצלחה" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
