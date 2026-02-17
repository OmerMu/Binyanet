// client/src/components/LoginModal.jsx

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
  const [captchaToken, setCaptchaToken] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // אם אצלך השרת ב-DEV ומדלג על captcha, אפשר להשאיר בלי חובה
    // אבל נשמור את זה כמו שהיה אצלך:
    if (!captchaToken) {
      setError("נא לאשר שאינך רובוט");
      return;
    }

    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
        captchaToken,
      });

      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      window.location.href = roleHome(user.role);
    } catch (err) {
      setError("פרטי התחברות שגויים.");
    }
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black bg-opacity-60 z-40"
        onClick={onClose}
      ></div>

      <div className="fixed top-1/2 left-1/2 z-50 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 w-[90%] max-w-md rounded-lg shadow-lg">
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
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />
          <input
            type="password"
            placeholder="סיסמה"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
          />

          <ReCAPTCHA
            sitekey="6LfS_VorAAAAAMPRnGoiRi9eDRt3rHB_KRgTSJRP"
            onChange={(token) => setCaptchaToken(token)}
          />

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            התחבר
          </button>
        </form>

        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-gray-500 hover:text-red-600"
        >
          ✕
        </button>
      </div>
    </>
  );
}
