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
      const res = await api.post("/api/auth/register", form);
      setMsg(res.data?.message || "נרשמת בהצלחה! החשבון ממתין לאישור אדמין.");
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      setErr(error.response?.data?.message || "הרשמה נכשלה");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1">הרשמה</h1>
        <p className="text-gray-600 mb-4">
          לאחר ההרשמה, החשבון ימתין לאישור אדמין לפני שניתן להתחבר.
        </p>

        {msg && (
          <div className="mb-3 p-3 rounded bg-green-50 text-green-700">
            {msg}
          </div>
        )}
        {err && (
          <div className="mb-3 p-3 rounded bg-red-50 text-red-700">{err}</div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">שם מלא</label>
            <input
              className="w-full border rounded p-2"
              name="fullName"
              value={form.fullName}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">אימייל</label>
            <input
              className="w-full border rounded p-2"
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">טלפון</label>
            <input
              className="w-full border rounded p-2"
              name="phone"
              value={form.phone}
              onChange={onChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">סיסמה</label>
            <input
              className="w-full border rounded p-2"
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              minLength={6}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              מבוקש (תפקיד)
            </label>
            <select
              className="w-full border rounded p-2"
              name="requestedRole"
              value={form.requestedRole}
              onChange={onChange}
            >
              <option value="tenant">דייר</option>
              <option value="committee">ועד</option>
              <option value="company">חברה/ספק</option>
            </select>
          </div>

          <button
            disabled={loading}
            className="w-full bg-black text-white rounded p-2 hover:opacity-90 disabled:opacity-60"
            type="submit"
          >
            {loading ? "נרשם..." : "הרשמה"}
          </button>
        </form>

        <p className="text-sm text-gray-600 mt-4">
          כבר יש לך חשבון?{" "}
          <Link to="/login" className="text-black font-semibold underline">
            התחברות
          </Link>
        </p>
      </div>
    </div>
  );
}
