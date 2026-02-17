import React, { useEffect, useState } from "react";

const API = "http://localhost:5000/api/system";

export default function SystemAdminUsers() {
  const [users, setUsers] = useState([]);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [usersRes, pendingRes] = await Promise.all([
        fetch(`${API}/get-users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API}/pending-users`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const usersData = await usersRes.json();
      const pendingData = await pendingRes.json();

      setUsers(Array.isArray(usersData) ? usersData : []);
      setPending(Array.isArray(pendingData) ? pendingData : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id) => {
    await fetch(`${API}/approve-user/${id}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAll();
  };

  const reject = async (id) => {
    await fetch(`${API}/reject-user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAll();
  };

  if (loading) return <div className="p-6">טוען...</div>;

  return (
    <div className="p-6 space-y-10">
      {/* ✅ Pending approvals */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">בקשות הרשמה ממתינות לאישור</h2>

        {pending.length === 0 ? (
          <div className="text-gray-600">אין בקשות ממתינות.</div>
        ) : (
          <div className="overflow-auto border rounded-lg bg-white">
            <table className="min-w-[800px] w-full text-right">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">שם</th>
                  <th className="p-3">אימייל</th>
                  <th className="p-3">תפקיד</th>
                  <th className="p-3">פעולות</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((u) => (
                  <tr key={u._id} className="border-t">
                    <td className="p-3">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3">{u.role}</td>
                    <td className="p-3 flex gap-2">
                      <button
                        onClick={() => approve(u._id)}
                        className="px-3 py-1 rounded bg-emerald-700 text-white hover:bg-emerald-800"
                      >
                        אשר
                      </button>
                      <button
                        onClick={() => reject(u._id)}
                        className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        דחה
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Existing users table (מה שכבר היה לך) */}
      <section className="space-y-3">
        <h2 className="text-xl font-bold">כל המשתמשים</h2>

        <div className="overflow-auto border rounded-lg bg-white">
          <table className="min-w-[900px] w-full text-right">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">שם</th>
                <th className="p-3">אימייל</th>
                <th className="p-3">תפקיד</th>
                <th className="p-3">מאושר?</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t">
                  <td className="p-3">{u.name}</td>
                  <td className="p-3">{u.email}</td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">{u.isApproved ? "כן" : "לא"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
