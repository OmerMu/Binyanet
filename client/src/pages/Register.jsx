import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    requestedRole: "tenant",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        ...form,
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
      });

      setMsg(
        res.data?.message ||
          "ההרשמה בוצעה בהצלחה. החשבון ממתין לאישור מנהל המערכת לפני שניתן להתחבר.",
      );

      setTimeout(() => navigate("/login"), 1400);
    } catch (error) {
      setErr(error.response?.data?.message || "ההרשמה נכשלה. נסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-100 flex items-center justify-center p-6"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="text-right">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border text-sm text-gray-700">
            יצירת חשבון חדש
          </p>

          <h1 className="text-2xl font-bold mt-4 mb-1">הרשמה למערכת</h1>
          <p className="text-gray-600 leading-7">
            לאחר ההרשמה, החשבון יועבר לאישור מנהל המערכת (אדמין). לאחר האישור
            תוכלו להתחבר ולהתחיל להשתמש במערכת.
          </p>
        </div>

        {msg && (
          <div className="mt-4 mb-3 p-3 rounded bg-green-50 text-green-700 text-right">
            {msg}
          </div>
        )}
        {err && (
          <div className="mt-4 mb-3 p-3 rounded bg-red-50 text-red-700 text-right">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3 mt-4">
          <div className="text-right">
            <label className="block text-sm font-medium mb-1">שם מלא</label>
            <input
              className="w-full border rounded-xl p-2"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              autoComplete="name"
              required
            />
          </div>

          <div className="text-right">
            <label className="block text-sm font-medium mb-1">אימייל</label>
            <input
              className="w-full border rounded-xl p-2"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="text-right">
            <label className="block text-sm font-medium mb-1">
              טלפון (אופציונלי)
            </label>
            <input
              className="w-full border rounded-xl p-2"
              name="phone"
              value={form.phone}
              onChange={onChange}
              autoComplete="tel"
            />
            <p className="text-xs text-gray-500 mt-1">
              משמש לחזרה אליכם במידת הצורך (למשל אימות/אישור חשבון).
            </p>
          </div>

          <div className="text-right">
            <label className="block text-sm font-medium mb-1">סיסמה</label>
            <input
              className="w-full border rounded-xl p-2"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <div className="text-right">
            <label className="block text-sm font-medium mb-1">
              תפקיד מבוקש
            </label>
            <select
              className="w-full border rounded-xl p-2"
              name="requestedRole"
              value={form.requestedRole}
              onChange={onChange}
            >
              <option value="tenant">דייר</option>
              <option value="committee">חבר ועד / הנהלת בניין</option>
              <option value="company">חברה / ספק שירות</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              התפקיד יאושר בהתאם להרשאות הבניין על ידי מנהל המערכת.
            </p>
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white rounded-xl p-2 hover:opacity-90 disabled:opacity-60"
            type="submit"
          >
            {loading ? "מבצע הרשמה..." : "הרשמה"}
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <Link to="/" className="underline hover:text-gray-700">
            חזרה לדף הבית
          </Link>
          <span>הנתונים נשמרים בצורה מאובטחת</span>
        </div>

        <p className="text-sm text-gray-600 mt-4 text-right">
          כבר יש לך חשבון?{" "}
          <Link to="/login" className="text-black font-semibold underline">
            התחברות
          </Link>
        </p>
      </div>
    </div>
  );
}
