import { useState } from "react";
import { Link } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import api from "../services/api";

function roleHome(role) {
  if (role === "admin") return "/admin";
  if (role === "company") return "/company";
  if (role === "committee") return "/committee";
  return "/tenant";
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
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
      setError(
        err?.response?.data?.message ||
          "ההתחברות נכשלה. בדוק את הפרטים ונסה שוב.",
      );
      setRecaptchaToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setForgotError("");
    setForgotMessage("");

    if (!forgotEmail.trim()) {
      setForgotError("נא להזין כתובת אימייל.");
      return;
    }

    setForgotLoading(true);

    try {
      const res = await api.post("/api/auth/forgot-password", {
        email: forgotEmail.trim().toLowerCase(),
      });

      setForgotMessage(res.data?.message || "אם המייל קיים נשלח קישור");
    } catch (err) {
      setForgotError(err?.response?.data?.message || "שליחת הקישור נכשלה.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="text-right">
          <label className="block text-sm font-medium text-gray-700">
            אימייל
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (!forgotEmail) setForgotEmail(e.target.value);
            }}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="text-right">
          <label className="block text-sm font-medium text-gray-700">
            סיסמה
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring focus:border-blue-500"
            placeholder="הזן סיסמה"
            autoComplete="current-password"
            required
          />
        </div>

        <div className="flex justify-between items-center text-sm">
          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={forgotLoading}
            className="text-blue-600 underline hover:text-blue-700 disabled:opacity-60"
          >
            {forgotLoading ? "שולח..." : "שכחתי סיסמה"}
          </button>

          <Link to="/register" className="text-gray-600 underline">
            להרשמה
          </Link>
        </div>

        <div className="flex justify-end pt-1">
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
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "מתחבר..." : "התחבר"}
        </button>
      </form>
    </div>
  );
}
