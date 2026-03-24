import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import axios from "axios";

export default function PayPalButton({ amount }) {
  const token = JSON.parse(localStorage.getItem("user"))?.token;

  return (
    <PayPalScriptProvider options={{ "client-id": "YOUR_CLIENT_ID" }}>
      <PayPalButtons
        createOrder={async () => {
          const res = await axios.post(
            "/api/payments/paypal/create-order",
            { amount },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          return res.data.id;
        }}
        onApprove={async (data) => {
          await axios.post(
            "/api/payments/paypal/capture",
            { orderId: data.orderID },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );

          alert("Payment successful!");
        }}
      />
    </PayPalScriptProvider>
  );
}
