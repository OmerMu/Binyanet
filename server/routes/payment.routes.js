const express = require("express");
const router = express.Router();

const Payment = require("../models/Payment");
const { protect, authorize } = require("../middleware/authMiddleware");
const { sendDiscordPaymentNotification } = require("../utils/discordNotifier");

function getBaseClientUrl() {
  return process.env.CLIENT_URL || "http://localhost:3000";
}

function normalizePaymentMethod(paymentMethod) {
  const allowed = ["bit", "paypal", "applepay", "googlepay", "credit"];
  const method = String(paymentMethod || "credit")
    .toLowerCase()
    .trim();
  return allowed.includes(method) ? method : "credit";
}

function getPayPalClient() {
  const paypal = require("@paypal/checkout-server-sdk");

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const mode = String(process.env.PAYPAL_MODE || "sandbox").toLowerCase();

  if (!clientId || !clientSecret) {
    throw new Error("PayPal env vars are missing");
  }

  const environment =
    mode === "live"
      ? new paypal.core.LiveEnvironment(clientId, clientSecret)
      : new paypal.core.SandboxEnvironment(clientId, clientSecret);

  return {
    paypal,
    client: new paypal.core.PayPalHttpClient(environment),
  };
}

async function sendPaymentDiscordNotification(req, payment, providerOverride) {
  try {
    await sendDiscordPaymentNotification({
      tenantName: req.user.fullName,
      tenantEmail: req.user.email,
      amount: payment.amount,
      city: payment.city,
      monthKey: payment.monthKey,
      buildingId: payment.buildingId,
      provider: providerOverride || payment.provider || "credit",
      paymentId: payment._id,
      paidAt: payment.paidAt || payment.createdAt,
    });
  } catch (discordError) {
    console.error("Discord payment notification failed:", discordError.message);
  }
}

async function createDirectPayment({ req, amount, city, monthKey, provider }) {
  const payment = await Payment.create({
    tenantId: req.user._id,
    buildingId: String(req.user.buildingId || "default-building"),
    city: String(city || "לא ידוע").trim(),
    amount: Number(amount),
    monthKey: String(monthKey).trim(),
    provider,
    status: "paid",
    paidAt: new Date(),
  });

  await sendPaymentDiscordNotification(req, payment, provider);
  return payment;
}

router.post("/", protect, authorize("tenant"), async (req, res) => {
  try {
    const { amount, city, monthKey, paymentMethod } = req.body;

    if (amount === undefined || amount === null || Number(amount) <= 0) {
      return res.status(400).json({ message: "amount must be greater than 0" });
    }

    if (!monthKey) {
      return res
        .status(400)
        .json({ message: "monthKey is required (e.g. 2026-03)" });
    }

    const provider = normalizePaymentMethod(paymentMethod);

    if (provider === "paypal") {
      const pendingPayment = await Payment.create({
        tenantId: req.user._id,
        buildingId: String(req.user.buildingId || "default-building"),
        city: String(city || "לא ידוע").trim(),
        amount: Number(amount),
        monthKey: String(monthKey).trim(),
        provider: "paypal",
        status: "pending",
      });

      try {
        const { paypal, client } = getPayPalClient();
        const request = new paypal.orders.OrdersCreateRequest();

        request.prefer("return=representation");
        request.requestBody({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: String(pendingPayment._id),
              amount: {
                currency_code: "USD",
                value: Number(amount).toFixed(2),
              },
            },
          ],
          application_context: {
            brand_name: "Binyanet",
            landing_page: "LOGIN",
            user_action: "PAY_NOW",
            return_url: `${getBaseClientUrl()}/tenant?paypal=success`,
            cancel_url: `${getBaseClientUrl()}/tenant?paypal=cancel`,
          },
        });

        const order = await client.execute(request);
        const approvalUrl =
          order.result.links?.find((link) => link.rel === "approve")?.href ||
          "";

        pendingPayment.externalPaymentId = order.result.id;
        pendingPayment.approvalUrl = approvalUrl;
        await pendingPayment.save();

        return res.status(201).json({
          provider: "paypal",
          flow: "redirect",
          approvalUrl,
          orderId: order.result.id,
          paymentId: pendingPayment._id,
        });
      } catch (paypalError) {
        pendingPayment.status = "failed";
        await pendingPayment.save();

        return res.status(500).json({
          message: "PayPal order creation failed",
          error: paypalError.message,
        });
      }
    }

    const payment = await createDirectPayment({
      req,
      amount,
      city,
      monthKey,
      provider,
    });

    return res.status(201).json({
      provider,
      flow: "direct",
      payment,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Payment failed", error: err.message });
  }
});

router.get(
  "/paypal/capture",
  protect,
  authorize("tenant"),
  async (req, res) => {
    try {
      const orderId = String(req.query.orderId || "").trim();

      if (!orderId) {
        return res.status(400).json({ message: "orderId is required" });
      }

      const payment = await Payment.findOne({
        tenantId: req.user._id,
        provider: "paypal",
        externalPaymentId: orderId,
      });

      if (!payment) {
        return res.status(404).json({ message: "PayPal payment not found" });
      }

      if (payment.status === "paid") {
        return res.json({ message: "Payment already captured", payment });
      }

      const { paypal, client } = getPayPalClient();
      const request = new paypal.orders.OrdersCaptureRequest(orderId);
      request.requestBody({});

      const capture = await client.execute(request);
      const captureStatus = capture.result.status;

      payment.status = captureStatus === "COMPLETED" ? "paid" : "failed";
      payment.paidAt = captureStatus === "COMPLETED" ? new Date() : null;
      await payment.save();

      if (payment.status === "paid") {
        await sendPaymentDiscordNotification(req, payment, "paypal");
      }

      return res.json({
        message:
          captureStatus === "COMPLETED"
            ? "PayPal payment captured successfully"
            : "PayPal payment was not completed",
        payment,
        paypalStatus: captureStatus,
      });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "PayPal capture failed", error: err.message });
    }
  },
);

router.get("/my", protect, authorize("tenant"), async (req, res) => {
  try {
    const rows = await Payment.find({ tenantId: req.user._id }).sort({
      createdAt: -1,
    });

    return res.json(rows);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to load payments", error: err.message });
  }
});

router.get("/committee", protect, authorize("committee"), async (req, res) => {
  try {
    const buildingId = req.user.buildingId || null;
    const filter = buildingId ? { buildingId } : {};

    const rows = await Payment.find(filter)
      .populate("tenantId", "fullName email")
      .sort({ createdAt: -1 });

    return res.json(rows);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to load payments", error: err.message });
  }
});

module.exports = router;
19;

// const express = require("express");
// const router = express.Router();

// const Payment = require("../models/Payment");
// const { protect, authorize } = require("../middleware/authMiddleware");

// function getBaseClientUrl() {
//   return process.env.CLIENT_URL || "http://localhost:3000";
// }

// function normalizePaymentMethod(paymentMethod) {
//   const allowed = ["bit", "paypal", "applepay", "googlepay", "credit"];
//   const method = String(paymentMethod || "credit")
//     .toLowerCase()
//     .trim();
//   return allowed.includes(method) ? method : "credit";
// }

// function getPayPalClient() {
//   const paypal = require("@paypal/checkout-server-sdk");

//   const clientId = process.env.PAYPAL_CLIENT_ID;
//   const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
//   const mode = String(process.env.PAYPAL_MODE || "sandbox").toLowerCase();

//   if (!clientId || !clientSecret) {
//     throw new Error("PayPal env vars are missing");
//   }

//   const environment =
//     mode === "live"
//       ? new paypal.core.LiveEnvironment(clientId, clientSecret)
//       : new paypal.core.SandboxEnvironment(clientId, clientSecret);

//   return {
//     paypal,
//     client: new paypal.core.PayPalHttpClient(environment),
//   };
// }

// async function createDirectPayment({ req, amount, city, monthKey, provider }) {
//   const payment = await Payment.create({
//     tenantId: req.user._id,
//     buildingId: String(req.user.buildingId || "default-building"),
//     city: String(city || "לא ידוע").trim(),
//     amount: Number(amount),
//     monthKey: String(monthKey).trim(),
//     provider,
//     status: "paid",
//     paidAt: new Date(),
//   });

//   return payment;
// }

// router.post("/", protect, authorize("tenant"), async (req, res) => {
//   try {
//     const { amount, city, monthKey, paymentMethod } = req.body;

//     if (amount === undefined || amount === null || Number(amount) <= 0) {
//       return res.status(400).json({ message: "amount must be greater than 0" });
//     }

//     if (!monthKey) {
//       return res
//         .status(400)
//         .json({ message: "monthKey is required (e.g. 2026-03)" });
//     }

//     const provider = normalizePaymentMethod(paymentMethod);

//     if (provider === "paypal") {
//       const pendingPayment = await Payment.create({
//         tenantId: req.user._id,
//         buildingId: String(req.user.buildingId || "default-building"),
//         city: String(city || "לא ידוע").trim(),
//         amount: Number(amount),
//         monthKey: String(monthKey).trim(),
//         provider: "paypal",
//         status: "pending",
//       });

//       try {
//         const { paypal, client } = getPayPalClient();
//         const request = new paypal.orders.OrdersCreateRequest();

//         request.prefer("return=representation");
//         request.requestBody({
//           intent: "CAPTURE",
//           purchase_units: [
//             {
//               reference_id: String(pendingPayment._id),
//               amount: {
//                 currency_code: "USD",
//                 value: Number(amount).toFixed(2),
//               },
//             },
//           ],
//           application_context: {
//             brand_name: "Binyanet",
//             landing_page: "LOGIN",
//             user_action: "PAY_NOW",
//             return_url: `${getBaseClientUrl()}/tenant?paypal=success`,
//             cancel_url: `${getBaseClientUrl()}/tenant?paypal=cancel`,
//           },
//         });

//         const order = await client.execute(request);
//         const approvalUrl =
//           order.result.links?.find((link) => link.rel === "approve")?.href ||
//           "";

//         pendingPayment.externalPaymentId = order.result.id;
//         pendingPayment.approvalUrl = approvalUrl;
//         await pendingPayment.save();

//         return res.status(201).json({
//           provider: "paypal",
//           flow: "redirect",
//           approvalUrl,
//           orderId: order.result.id,
//           paymentId: pendingPayment._id,
//         });
//       } catch (paypalError) {
//         pendingPayment.status = "failed";
//         await pendingPayment.save();

//         return res.status(500).json({
//           message: "PayPal order creation failed",
//           error: paypalError.message,
//         });
//       }
//     }

//     const payment = await createDirectPayment({
//       req,
//       amount,
//       city,
//       monthKey,
//       provider,
//     });

//     return res.status(201).json({
//       provider,
//       flow: "direct",
//       payment,
//     });
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Payment failed", error: err.message });
//   }
// });

// router.get(
//   "/paypal/capture",
//   protect,
//   authorize("tenant"),
//   async (req, res) => {
//     try {
//       const orderId = String(req.query.orderId || "").trim();

//       if (!orderId) {
//         return res.status(400).json({ message: "orderId is required" });
//       }

//       const payment = await Payment.findOne({
//         tenantId: req.user._id,
//         provider: "paypal",
//         externalPaymentId: orderId,
//       });

//       if (!payment) {
//         return res.status(404).json({ message: "PayPal payment not found" });
//       }

//       if (payment.status === "paid") {
//         return res.json({ message: "Payment already captured", payment });
//       }

//       const { paypal, client } = getPayPalClient();
//       const request = new paypal.orders.OrdersCaptureRequest(orderId);
//       request.requestBody({});

//       const capture = await client.execute(request);
//       const captureStatus = capture.result.status;

//       payment.status = captureStatus === "COMPLETED" ? "paid" : "failed";
//       payment.paidAt = captureStatus === "COMPLETED" ? new Date() : null;
//       await payment.save();

//       return res.json({
//         message:
//           captureStatus === "COMPLETED"
//             ? "PayPal payment captured successfully"
//             : "PayPal payment was not completed",
//         payment,
//         paypalStatus: captureStatus,
//       });
//     } catch (err) {
//       return res
//         .status(500)
//         .json({ message: "PayPal capture failed", error: err.message });
//     }
//   },
// );

// router.get("/my", protect, authorize("tenant"), async (req, res) => {
//   try {
//     const rows = await Payment.find({ tenantId: req.user._id }).sort({
//       createdAt: -1,
//     });

//     return res.json(rows);
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Failed to load payments", error: err.message });
//   }
// });

// router.get("/committee", protect, authorize("committee"), async (req, res) => {
//   try {
//     const buildingId = req.user.buildingId || null;
//     const filter = buildingId ? { buildingId } : {};

//     const rows = await Payment.find(filter)
//       .populate("tenantId", "fullName email")
//       .sort({ createdAt: -1 });

//     return res.json(rows);
//   } catch (err) {
//     return res
//       .status(500)
//       .json({ message: "Failed to load payments", error: err.message });
//   }
// });

// module.exports = router;
