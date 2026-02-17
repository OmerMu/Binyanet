require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const paymentRoutes = require("./routes/payment.routes");

// ראוטים
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/faults", require("./routes/fault.routes"));
app.use("/api/system", require("./routes/system.routes"));
app.use("/api/analytics", require("./routes/analytics.routes"));
app.use("/api/payments", paymentRoutes);
// חיבור לדאטהבייס
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// הרצת השרת
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
