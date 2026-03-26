import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("הסיסמה חייבת להכיל לפחות 6 תווים.");
      return;
    }

    if (password !== confirmPassword) {
      setError("הסיסמאות אינן תואמות.");
      return;
    }

    setLoading(true);

    try {
      const res = await api.post(`/api/auth/reset-password/${token}`, {
        password,
      });

      setSuccess(res.data?.message || "הסיסמה עודכנה בהצלחה.");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "איפוס הסיסמה נכשל.");
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
          <h1 className="text-2xl font-bold mt-2">איפוס סיסמה</h1>
          <p className="text-gray-600 mt-2 leading-7">
            הזן סיסמה חדשה לחשבון שלך.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700">
              סיסמה חדשה
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          <div className="text-right">
            <label className="block text-sm font-medium text-gray-700">
              אימות סיסמה
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-right">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm text-right">{success}</div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "מעדכן..." : "עדכן סיסמה"}
          </button>
        </form>

        <div className="mt-5 text-right text-sm text-gray-600">
          <Link to="/login" className="text-black font-semibold underline">
            חזרה להתחברות
          </Link>
        </div>
      </div>
    </div>
  );
}
