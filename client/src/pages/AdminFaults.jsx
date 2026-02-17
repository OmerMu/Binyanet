import { useEffect, useState } from "react";

export default function AdminFaults() {
  const [faults, setFaults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [noteDrafts, setNoteDrafts] = useState({});
  const [historyDrafts, setHistoryDrafts] = useState({});

  const token = localStorage.getItem("token");

  const fetchFaults = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/faults/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setFaults(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFault = async (id, payload) => {
    await fetch(`http://localhost:5000/api/faults/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    fetchFaults();
  };

  const statusLabel = (s) => {
    if (s === "open") return "פתוחה";
    if (s === "in_progress") return "בטיפול";
    if (s === "closed") return "סגורה";
    return s;
  };

  if (loading) return <div className="p-6">טוען תקלות...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">ניהול תקלות (אדמין)</h1>

      {faults.length === 0 ? (
        <div className="text-gray-600">אין תקלות.</div>
      ) : (
        <div className="overflow-auto border rounded-lg bg-white">
          <table className="min-w-[1200px] w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">כותרת</th>
                <th className="p-3">תיאור</th>
                <th className="p-3">סטטוס</th>
                <th className="p-3">נוצר</th>
                <th className="p-3">עדכן סטטוס</th>
                <th className="p-3">הערה לדייר</th>
                <th className="p-3">היסטוריית טיפולים</th>
              </tr>
            </thead>

            <tbody>
              {faults.map((f) => (
                <tr key={f._id} className="border-t align-top">
                  <td className="p-3 font-semibold">{f.title}</td>
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

                  {/* Admin note */}
                  <td className="p-3">
                    <div className="text-sm text-gray-700 mb-2">
                      {f.adminNote ? (
                        f.adminNote
                      ) : (
                        <span className="text-gray-400">אין הערה</span>
                      )}
                    </div>

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

                  {/* History */}
                  <td className="p-3">
                    <div className="text-sm text-gray-700 space-y-2 mb-3">
                      {(f.history || []).length === 0 ? (
                        <div className="text-gray-400">אין היסטוריה עדיין</div>
                      ) : (
                        (f.history || [])
                          .slice(-4)
                          .reverse()
                          .map((h, idx) => (
                            <div
                              key={idx}
                              className="border rounded p-2 bg-gray-50"
                            >
                              <div className="font-medium">{h.text}</div>
                              <div className="text-xs text-gray-500">
                                {h.byName ? `${h.byName} · ` : ""}
                                {h.createdAt
                                  ? new Date(h.createdAt).toLocaleString(
                                      "he-IL",
                                    )
                                  : ""}
                              </div>
                            </div>
                          ))
                      )}
                    </div>

                    <input
                      className="w-72 border rounded px-2 py-1 text-sm"
                      value={historyDrafts[f._id] ?? ""}
                      onChange={(e) =>
                        setHistoryDrafts((prev) => ({
                          ...prev,
                          [f._id]: e.target.value,
                        }))
                      }
                      placeholder='דוגמה: "הוזמן אינסטלטור"'
                    />

                    <button
                      onClick={() => {
                        const text = (historyDrafts[f._id] ?? "").trim();
                        if (!text) return;
                        setHistoryDrafts((prev) => ({ ...prev, [f._id]: "" }));
                        updateFault(f._id, { historyNote: text });
                      }}
                      className="mt-2 px-3 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800 text-sm"
                    >
                      הוסף עדכון טיפול
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
