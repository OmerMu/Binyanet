const { Resend } = require("resend");

function getClientUrl() {
  return process.env.CLIENT_URL || "http://localhost:3000";
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

async function sendEmail({ to, subject, html }) {
  try {
    const resend = getResendClient();
    const from = process.env.RESEND_FROM;

    if (!resend || !from || !to) {
      return { skipped: true };
    }

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) {
      console.error("Resend send error:", error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error("Resend unexpected error:", error.message);
    return { error };
  }
}

async function sendPendingApprovalEmail(user) {
  if (!user?.email) return;

  return sendEmail({
    to: user.email,
    subject: "ההרשמה התקבלה במערכת Binyanet",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8;">
        <h2>ההרשמה התקבלה</h2>
        <p>שלום ${user.fullName || ""},</p>
        <p>בקשת ההרשמה שלך התקבלה בהצלחה וממתינה לאישור מנהל המערכת.</p>
        <p>נעדכן אותך במייל נוסף ברגע שהחשבון יאושר.</p>
      </div>
    `,
  });
}

async function sendApprovalEmail(user) {
  if (!user?.email) return;

  return sendEmail({
    to: user.email,
    subject: "החשבון שלך אושר במערכת Binyanet",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8;">
        <h2>החשבון אושר</h2>
        <p>שלום ${user.fullName || ""},</p>
        <p>החשבון שלך אושר בהצלחה.</p>
        <p>
          ניתן להתחבר למערכת כאן:
          <a href="${getClientUrl()}/login">${getClientUrl()}/login</a>
        </p>
      </div>
    `,
  });
}

async function sendPasswordResetEmail(user, resetToken) {
  if (!user?.email || !resetToken) return;

  const resetUrl = `${getClientUrl()}/reset-password/${resetToken}`;

  return sendEmail({
    to: user.email,
    subject: "איפוס סיסמה - Binyanet",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8;">
        <h2>איפוס סיסמה</h2>
        <p>שלום ${user.fullName || ""},</p>
        <p>התקבלה בקשה לאיפוס סיסמה.</p>
        <p>לחץ על הקישור הבא כדי לבחור סיסמה חדשה:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>הקישור תקף ל-15 דקות בלבד.</p>
      </div>
    `,
  });
}

async function sendFaultCreatedEmail(user, fault) {
  if (!user?.email || !fault) return;

  return sendEmail({
    to: user.email,
    subject: "התקלה נפתחה בהצלחה",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8;">
        <h2>פתיחת תקלה חדשה</h2>
        <p>שלום ${user.fullName || ""},</p>
        <p>התקלה שלך נפתחה בהצלחה.</p>
        <p><strong>כותרת:</strong> ${fault.title || ""}</p>
        <p><strong>תיאור:</strong> ${fault.description || ""}</p>
        <p><strong>סטטוס:</strong> ${fault.status || "open"}</p>
      </div>
    `,
  });
}

async function sendPaymentReceiptEmail(user, payment) {
  if (!user?.email || !payment) return;

  return sendEmail({
    to: user.email,
    subject: "אישור תשלום - Binyanet",
    html: `
      <div dir="rtl" style="font-family: Arial, sans-serif; line-height: 1.8;">
        <h2>אישור תשלום</h2>
        <p>שלום ${user.fullName || ""},</p>
        <p>התשלום התקבל בהצלחה.</p>
        <p><strong>סכום:</strong> ₪${Number(payment.amount || 0).toLocaleString("he-IL")}</p>
        <p><strong>חודש:</strong> ${payment.monthKey || ""}</p>
        <p><strong>אמצעי תשלום:</strong> ${payment.provider || "credit"}</p>
        <p><strong>סטטוס:</strong> ${payment.status || ""}</p>
      </div>
    `,
  });
}

module.exports = {
  sendEmail,
  sendPendingApprovalEmail,
  sendApprovalEmail,
  sendPasswordResetEmail,
  sendFaultCreatedEmail,
  sendPaymentReceiptEmail,
};
