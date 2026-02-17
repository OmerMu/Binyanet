import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

const ROLE_OPTIONS = [
  { value: "tenant", label: "דייר" },
  { value: "committee", label: "ועד" },
  { value: "company", label: "חברה" },
  { value: "admin", label: "אדמין" },
];

export default function AdminTenants() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const pendingUsers = useMemo(
    () => users.filter((u) => !u.isApproved),
    [users],
  );

  const loadUsers = async () => {
    setErr("");
    setMsg("");
    setLoading(true);
    try {
      const res = await api.get("/api/system/users");
      setUsers(res.data || []);
    } catch (e) {
      setErr(e.response?.data?.message || "שגיאה בשליפת משתמשים");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const setUserRoleLocal = (id, role) => {
    setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
  };

  const approveUser = async (user) => {
    setErr("");
    setMsg("");
    try {
      // 1) קודם נאשר את המשתמש (isApproved=true)
      await api.patch(`/api/system/users/${user._id}/approve`, {
        isApproved: true,
      });

      // 2) ואז נעדכן role לפי הבחירה (אם צריך)
      await api.patch(`/api/system/users/${user._id}/role`, {
        role: user.role,
      });

      setMsg(`המשתמש ${user.email} אושר בהצלחה`);
      await loadUsers();
    } catch (e) {
      setErr(e.response?.data?.message || "שגיאה באישור משתמש");
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-800">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">אישור משתמשים וניהול תפקידים</h1>
        <p className="text-gray-600">
          כאן אדמין מאשר משתמשים ממתינים ומגדיר להם Role (בלי לגעת ב-DB ידנית).
        </p>
      </div>

      {msg && (
        <div className="mb-3 p-3 rounded bg-green-50 text-green-700">{msg}</div>
      )}
      {err && (
        <div className="mb-3 p-3 rounded bg-red-50 text-red-700">{err}</div>
      )}

      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold">ממתינים לאישור</h2>
          <button
            className="border rounded px-3 py-1 hover:bg-gray-50"
            onClick={loadUsers}
            disabled={loading}
          >
            רענון
          </button>
        </div>

        {loading ? (
          <p>טוען...</p>
        ) : pendingUsers.length === 0 ? (
          <p className="text-gray-600">אין משתמשים שממתינים לאישור.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">שם</th>
                  <th className="py-2">אימייל</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">פעולה</th>
                </tr>
              </thead>
              <tbody>
                {pendingUsers.map((u) => (
                  <tr key={u._id} className="border-b">
                    <td className="py-2">{u.fullName}</td>
                    <td className="py-2">{u.email}</td>

                    <td className="py-2">
                      <select
                        className="border rounded p-1"
                        value={u.role || "tenant"}
                        onChange={(e) =>
                          setUserRoleLocal(u._id, e.target.value)
                        }
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="py-2">
                      <button
                        className="bg-black text-white rounded px-3 py-1 hover:opacity-90"
                        onClick={() => approveUser(u)}
                      >
                        אשר
                      </button>
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
