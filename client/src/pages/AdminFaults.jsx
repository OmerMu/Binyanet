import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function AdminFaults() {
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [noteDrafts, setNoteDrafts] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [q, setQ] = useState("");

  const statusLabel = (s) => {
    if (s === "open") return "פתוחה";
    if (s === "in_progress") return "בטיפול";
    if (s === "closed") return "סגורה";
    return s;
  };

  const loadFaults = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/faults");
      setFaults(res.data);
    } catch (err) {
      setError("לא הצלחנו לטעון תקלות. ודא שאתה מחובר כאדמין וששרת רץ.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaults();
  }, []);

  const updateFault = async (faultId, payload) => {
    try {
      const res = await api.patch(`/api/faults/${faultId}`, payload);
      setFaults((prev) => prev.map((f) => (f._id === faultId ? res.data : f)));
      // אופציונלי: אם שמרנו הערה, ננקה טיוטה
      if (payload.adminNote !== undefined) {
        setNoteDrafts((prev) => {
          const copy = { ...prev };
          delete copy[faultId];
          return copy;
        });
      }
    } catch (err) {
      alert("עדכון תקלה נכשל");
    }
  };

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    return faults.filter((f) => {
      const matchStatus =
        statusFilter === "all" ? true : f.status === statusFilter;

      const matchText =
        !text ||
        (f.title || "").toLowerCase().includes(text) ||
        (f.description || "").toLowerCase().includes(text) ||
        (f.adminNote || "").toLowerCase().includes(text);

      return matchStatus && matchText;
    });
  }, [faults, statusFilter, q]);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-100 text-gray-800">
        טוען תקלות...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-800">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <h1 className="text-3xl font-bold">ניהול תקלות</h1>

        <button
          onClick={loadFaults}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          רענון
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded shadow p-4 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">סטטוס:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">הכל</option>
            <option value="open">פתוחות</option>
            <option value="in_progress">בטיפול</option>
            <option value="closed">סגורות</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">חיפוש:</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="border rounded px-3 py-1 w-full sm:w-80"
            placeholder="חפש לפי כותרת/תיאור/הערת ועד..."
          />
        </div>

        <div className="text-sm text-gray-600">
          מציג {filtered.length} מתוך {faults.length}
        </div>
      </div>

      {error && (
        <div className="bg-white border border-red-200 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white p-4 rounded shadow">אין תקלות להצגה.</div>
      ) : (
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-3">כותרת</th>
                <th className="p-3">תיאור</th>
                <th className="p-3">סטטוס</th>
                <th className="p-3">נוצר</th>
                <th className="p-3">שינוי סטטוס</th>
                <th className="p-3">הערת ועד</th>
                <th className="p-3">עדכון הערה</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => (
                <tr key={f._id} className="border-b align-top">
                  <td className="p-3 font-medium">{f.title}</td>

                  <td className="p-3 text-gray-700">{f.description}</td>

                  <td className="p-3">
                    <span className="px-2 py-1 rounded text-sm bg-gray-100">
                      {statusLabel(f.status)}
                    </span>
                  </td>

                  <td className="p-3 text-sm text-gray-600">
                    {f.createdAt
                      ? new Date(f.createdAt).toLocaleString("he-IL")
                      : "-"}
                  </td>

                  <td className="p-3">
                    <select
                      value={f.status}
                      onChange={(e) =>
                        updateFault(f._id, { status: e.target.value })
                      }
                      className="border rounded px-2 py-1"
                    >
                      <option value="open">פתוחה</option>
                      <option value="in_progress">בטיפול</option>
                      <option value="closed">סגורה</option>
                    </select>
                  </td>

                  <td className="p-3">
                    <div className="text-sm text-gray-700">
                      {f.adminNote ? (
                        f.adminNote
                      ) : (
                        <span className="text-gray-400">אין הערה</span>
                      )}
                    </div>
                  </td>

                  <td className="p-3">
                    <textarea
                      className="w-72 border rounded px-2 py-1 text-sm"
                      rows={2}
                      value={noteDrafts[f._id] ?? f.adminNote ?? ""}
                      onChange={(e) =>
                        setNoteDrafts((prev) => ({
                          ...prev,
                          [f._id]: e.target.value,
                        }))
                      }
                      placeholder="כתוב עדכון לדייר..."
                    />
                    <button
                      onClick={() =>
                        updateFault(f._id, {
                          adminNote: noteDrafts[f._id] ?? "",
                        })
                      }
                      className="mt-2 px-3 py-1 rounded bg-gray-800 text-white hover:bg-black text-sm"
                    >
                      שמור הערה
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
