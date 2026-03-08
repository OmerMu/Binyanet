import { useState } from "react";
import api from "../services/api";

export default function LeadForm() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [buildingSize, setBuildingSize] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOk("");
    setError("");

    try {
      await api.post("/api/leads", {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        buildingSize: buildingSize.trim() || undefined,
        message: message.trim() || undefined,
      });

      setOk("הפרטים נשלחו בהצלחה. נחזור אליך בהקדם 🙂");
      setFullName("");
      setPhone("");
      setEmail("");
      setBuildingSize("");
      setMessage("");
    } catch (err) {
      setError("שליחת הפרטים נכשלה. ודא שהשרת רץ ונסה שוב.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
      dir="rtl"
    >
      <h3 className="text-xl font-bold text-right">השארת פרטים</h3>
      <p className="text-sm text-gray-600 text-right mt-2 leading-6">
        נשמח לתאם הצגת מערכת קצרה ולהתאים את הפתרון לצורכי הבניין.
      </p>

      <div className="mt-4 space-y-3">
        <div className="text-right">
          <label className="block text-sm font-medium mb-1">שם מלא *</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="לדוגמה: עומר מוסאי"
            required
          />
        </div>

        <div className="text-right">
          <label className="block text-sm font-medium mb-1">טלפון *</label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="050-1234567"
            required
          />
        </div>

        <div className="text-right">
          <label className="block text-sm font-medium mb-1">אימייל</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="name@example.com"
          />
        </div>

        <div className="text-right">
          <label className="block text-sm font-medium mb-1">
            גודל בניין (אופציונלי)
          </label>
          <input
            value={buildingSize}
            onChange={(e) => setBuildingSize(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="לדוגמה: 24 דירות"
          />
        </div>

        <div className="text-right">
          <label className="block text-sm font-medium mb-1">הודעה</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="אם יש משהו חשוב שנדע לפני ההדגמה — כתוב כאן."
          />
        </div>

        {error && (
          <div className="text-red-700 text-sm bg-red-50 border border-red-100 rounded-lg p-3 text-right">
            {error}
          </div>
        )}
        {ok && (
          <div className="text-emerald-800 text-sm bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-right">
            {ok}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 disabled:opacity-60 transition"
        >
          {loading ? "שולח..." : "שלח פרטים"}
        </button>
      </div>
    </form>
  );
}
