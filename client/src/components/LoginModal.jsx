import { useState } from "react";
import api from "../services/api";
import ReCAPTCHA from "react-google-recaptcha";

function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "company") return "/company";
  if (role === "committee") return "/committee";
  return "/tenant";
}

export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [forgotError, setForgotError] = useState("");

  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);

  const siteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!siteKey) {
      setError("חסר REACT_APP_RECAPTCHA_SITE_KEY בקובץ .env של הלקוח.");
      return;
    }

    if (!recaptchaToken) {
      setError("נא לאשר reCAPTCHA לפני התחברות.");
      return;
    }

    setLoading(true);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    try {
      const res = await api.post("/api/auth/login", {
        email: email.trim().toLowerCase(),
        password,
        recaptchaToken,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = roleHome(user.role);
    } catch (err) {
      setError(err?.response?.data?.message || "פרטי התחברות שגויים.");
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotError("");
    setForgotMessage("");

    if (!email.trim()) {
      setForgotError("הזן קודם את האימייל שלך.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await api.post("/api/auth/forgot-password", {
        email: email.trim().toLowerCase(),
      });

      setForgotMessage(res.data?.message || "אם המייל קיים נשלח קישור");
    } catch (err) {
      setForgotError(err?.response?.data?.message || "שליחת הקישור נכשלה.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40" onClick={onClose}></div>

      <div
        className="fixed top-1/2 left-1/2 z-50 -translate-x-1/2 -translate-y-1/2 bg-white p-6 w-[90%] max-w-md rounded-2xl shadow-lg"
        dir="rtl"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
          התחברות
        </h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="אימייל"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />

          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={forgotLoading}
              className="text-blue-600 underline hover:text-blue-700 disabled:opacity-60"
            >
              {forgotLoading ? "שולח..." : "שכחתי סיסמה"}
            </button>
          </div>

          <div className="flex justify-end">
            <ReCAPTCHA
              sitekey={siteKey}
              onChange={(token) => setRecaptchaToken(token)}
              onExpired={() => setRecaptchaToken(null)}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-right">{error}</div>
          )}
          {forgotError && (
            <div className="text-red-600 text-sm text-right">{forgotError}</div>
          )}
          {forgotMessage && (
            <div className="text-green-600 text-sm text-right">
              {forgotMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "מתחבר..." : "התחבר"}
          </button>
        </form>

        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-gray-500 hover:text-red-600"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </>
  );
}
