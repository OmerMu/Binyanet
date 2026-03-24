const paypal = require("@paypal/checkout-server-sdk");

function environment() {
  if (process.env.PAYPAL_MODE === "live") {
    return new paypal.core.LiveEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET,
    );
  }
  return new paypal.core.SandboxEnvironment(
    process.env.PAYPAL_CLIENT_ID,
    process.env.PAYPAL_CLIENT_SECRET,
  );
}

const client = new paypal.core.PayPalHttpClient(environment());

// יצירת הזמנה
exports.createOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    const request = new paypal.orders.OrdersCreateRequest();
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "ILS",
            value: amount.toString(),
          },
        },
      ],
    });

    const order = await client.execute(request);

    res.json({ id: order.result.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// אישור תשלום
exports.captureOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});

    const capture = await client.execute(request);

    res.json(capture.result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
