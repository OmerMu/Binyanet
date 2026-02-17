const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register
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

    res.status(201).json({
      message: "Registration successful. Waiting for admin approval.",
      userId: user._id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Registration failed", error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isApproved) {
      return res.status(403).json({
        message: "User not approved yet. Please wait for admin approval.",
      });
    }

    const token = generateToken(user._id, user.role);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};
