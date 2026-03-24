async function sendDiscordPaymentNotification({
  tenantName,
  tenantEmail,
  amount,
  city,
  monthKey,
  buildingId,
  provider,
  paymentId,
  paidAt,
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(
      "DISCORD_WEBHOOK_URL is missing. Discord notification skipped.",
    );
    return;
  }

  const body = {
    username: "Binyanet Payments",
    content: "💸 התקבל תשלום חדש מדייר",
    embeds: [
      {
        title: "תשלום חדש במערכת",
        description: "התקבל תשלום חדש ונשמר בהצלחה במסד הנתונים.",
        fields: [
          {
            name: "דייר",
            value: tenantName || "לא ידוע",
            inline: true,
          },
          {
            name: "אימייל",
            value: tenantEmail || "לא ידוע",
            inline: true,
          },
          {
            name: "סכום",
            value: `₪${Number(amount || 0).toLocaleString("he-IL")}`,
            inline: true,
          },
          {
            name: "עיר",
            value: city || "לא ידוע",
            inline: true,
          },
          {
            name: "חודש חיוב",
            value: monthKey || "לא ידוע",
            inline: true,
          },
          {
            name: "ספק תשלום",
            value: provider || "credit",
            inline: true,
          },
          {
            name: "Building ID",
            value: buildingId ? String(buildingId) : "לא קיים",
            inline: false,
          },
          {
            name: "Payment ID",
            value: paymentId ? String(paymentId) : "לא קיים",
            inline: false,
          },
        ],
        timestamp: new Date(paidAt || new Date()).toISOString(),
      },
    ],
  };

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Discord webhook failed: ${response.status} ${text}`);
  }
}

module.exports = { sendDiscordPaymentNotification };
