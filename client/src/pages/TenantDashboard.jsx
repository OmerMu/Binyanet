import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function TenantDashboard() {
  const [user, setUser] = useState(null);
  const [faults, setFaults] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const statusLabel = (s) => {
    if (s === "open") return "פתוחה";
    if (s === "in_progress") return "בטיפול";
    if (s === "closed") return "סגורה";
    return s;
  };

  const loadMyFaults = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/faults/my");
      setFaults(res.data);
    } catch (err) {
      setError("לא הצלחנו לטעון את התקלות שלך. ודא שהשרת רץ ושאתה מחובר.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/");

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role === "admin") return navigate("/admin");
    if (parsedUser.role === "company") return navigate("/company");
    if (parsedUser.role === "committee") return navigate("/committee");

    setUser(parsedUser);
    loadMyFaults();
  }, [navigate]);

  const createFault = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.post("/api/faults", { title, description });
      setTitle("");
      setDescription("");
      await loadMyFaults();
    } catch (err) {
      setError("פתיחת תקלה נכשלה. בדוק שהכותרת והתיאור מלאים.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">דייר – אזור אישי</h1>
      <p className="mb-6">שלום, {user.fullName || user.email} 👋</p>

      <div className="bg-white rounded shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">פתח תקלה חדשה</h2>

        <form onSubmit={createFault} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">כותרת</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="לדוגמה: נזילה בכיור"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">תיאור</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="תאר בקצרה מה הבעיה ומתי התחילה..."
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm border border-red-200 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
          >
            {submitting ? "שולח..." : "פתח תקלה"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">התקלות שלי</h2>
          <button
            onClick={loadMyFaults}
            className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          >
            רענון
          </button>
        </div>

        {loading ? (
          <div>טוען...</div>
        ) : faults.length === 0 ? (
          <div className="text-gray-600">אין לך תקלות פתוחות/קודמות כרגע.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-3">כותרת</th>
                  <th className="p-3">סטטוס</th>
                  <th className="p-3">עדכון מהוועד</th>
                  <th className="p-3">נוצר</th>
                </tr>
              </thead>
              <tbody>
                {faults.map((f) => (
                  <tr key={f._id} className="border-b">
                    <td className="p-3 font-medium">{f.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded text-sm bg-gray-100">
                        {statusLabel(f.status)}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {f.adminNote ? (
                        f.adminNote
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {f.createdAt
                        ? new Date(f.createdAt).toLocaleString("he-IL")
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
