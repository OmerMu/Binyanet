import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ROLE_OPTIONS = [
  { value: "tenant", label: "דייר" },
  { value: "committee", label: "חבר ועד" },
  { value: "company", label: "חברה" },
  { value: "admin", label: "אדמין" },
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");

  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);

  const [usersError, setUsersError] = useState("");
  const [pendingError, setPendingError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [newUser, setNewUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    role: "tenant",
    isApproved: true,
  });

  const [creatingUser, setCreatingUser] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "admin") {
      navigate("/dashboard");
      return;
    }

    setUser(parsedUser);
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    loadUsers();
    loadPendingUsers();
  }, [user]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    setUsersError("");

    try {
      const res = await api.get("/api/system/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setUsers([]);
      setUsersError("לא הצלחנו לטעון את רשימת המשתמשים.");
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadPendingUsers = async () => {
    setLoadingPending(true);
    setPendingError("");

    try {
      const res = await api.get("/api/system/pending-users");
      setPendingUsers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setPendingUsers([]);
      setPendingError("לא הצלחנו לטעון את המשתמשים הממתינים.");
    } finally {
      setLoadingPending(false);
    }
  };

  const approveUser = async (id, role) => {
    setSuccessMessage("");
    try {
      await api.patch(`/api/system/approve-user/${id}`, { role });
      setSuccessMessage("המשתמש אושר בהצלחה.");
      await loadPendingUsers();
      await loadUsers();
    } catch (err) {
      alert(err?.response?.data?.message || "אישור המשתמש נכשל.");
    }
  };

  const rejectUser = async (id) => {
    const confirmDelete = window.confirm("לדחות ולמחוק את המשתמש?");
    if (!confirmDelete) return;

    setSuccessMessage("");
    try {
      await api.delete(`/api/system/reject-user/${id}`);
      setSuccessMessage("המשתמש נדחה ונמחק.");
      await loadPendingUsers();
      await loadUsers();
    } catch (err) {
      alert(err?.response?.data?.message || "דחיית המשתמש נכשלה.");
    }
  };

  const deleteUser = async (id) => {
    const confirmDelete = window.confirm("למחוק את המשתמש מהמערכת?");
    if (!confirmDelete) return;

    setSuccessMessage("");
    try {
      await api.delete(`/api/system/users/${id}`);
      setSuccessMessage("המשתמש נמחק בהצלחה.");
      await loadUsers();
      await loadPendingUsers();
    } catch (err) {
      alert(err?.response?.data?.message || "מחיקת המשתמש נכשלה.");
    }
  };

  const updateUserRole = async (id, role) => {
    setSuccessMessage("");
    try {
      await api.patch(`/api/system/users/${id}/role`, { role });
      setSuccessMessage("התפקיד עודכן בהצלחה.");
      await loadUsers();
      await loadPendingUsers();
    } catch (err) {
      alert(err?.response?.data?.message || "עדכון התפקיד נכשל.");
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setCreatingUser(true);

    try {
      await api.post("/api/system/users", newUser);
      setSuccessMessage("המשתמש נוצר בהצלחה.");
      setNewUser({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "tenant",
        isApproved: true,
      });
      await loadUsers();
    } catch (err) {
      alert(err?.response?.data?.message || "יצירת המשתמש נכשלה.");
    } finally {
      setCreatingUser(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const text =
        `${u.fullName || ""} ${u.email || ""} ${u.phone || ""}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  const counts = useMemo(() => {
    return {
      total: users.length,
      pending: pendingUsers.length,
      admins: users.filter((u) => u.role === "admin").length,
      companies: users.filter((u) => u.role === "company").length,
      committees: users.filter((u) => u.role === "committee").length,
      tenants: users.filter((u) => u.role === "tenant").length,
    };
  }, [users, pendingUsers]);

  if (!user) return null;

  const tabButton = (key, label) => {
    const active = tab === key;
    return (
      <button
        type="button"
        onClick={() => setTab(key)}
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
          active
            ? "bg-slate-900 text-white"
            : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
        }`}
      >
        {label}
      </button>
    );
  };

  const summaryCard = (title, value, subtitle = "") => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <p className="text-sm text-slate-500 mb-2">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
      {subtitle ? (
        <p className="text-xs text-slate-400 mt-2">{subtitle}</p>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
            ממשק מנהל מערכת (Admin)
          </h1>
          <p className="text-slate-600">
            שלום, {user.fullName || user.name || "מנהל מערכת"} 👋 ברוך הבא למרכז
            הניהול הראשי של המערכת.
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-6 gap-4 mb-8">
          {summaryCard("סה״כ משתמשים", counts.total)}
          {summaryCard("ממתינים לאישור", counts.pending)}
          {summaryCard("אדמינים", counts.admins)}
          {summaryCard("חברות", counts.companies)}
          {summaryCard("חברי ועד", counts.committees)}
          {summaryCard("דיירים", counts.tenants)}
        </div>

        <div className="flex gap-2 flex-wrap mb-8">
          {tabButton("home", "דף הבית")}
          {tabButton("users", "ניהול משתמשים")}
          {tabButton("pending", "בקשות ממתינות")}
          {tabButton("create", "הוספת משתמש")}
        </div>

        {tab === "home" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-xl font-semibold text-slate-900 mb-3">
                פעולות מהירות
              </h2>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setTab("pending")}
                  className="rounded-xl bg-emerald-600 text-white px-5 py-3 font-medium hover:bg-emerald-700 transition"
                >
                  עבור לבקשות ממתינות
                </button>

                <button
                  type="button"
                  onClick={() => setTab("users")}
                  className="rounded-xl bg-white border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50 transition"
                >
                  עבור לניהול משתמשים
                </button>

                <button
                  type="button"
                  onClick={() => setTab("create")}
                  className="rounded-xl bg-white border border-slate-300 px-5 py-3 font-medium hover:bg-slate-50 transition"
                >
                  הוסף משתמש חדש
                </button>
              </div>
            </div>
          </div>
        )}

        {tab === "pending" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  משתמשים ממתינים לאישור
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  אישור משתמשים חדשים ומתן הרשאה מתאימה.
                </p>
              </div>

              <button
                type="button"
                onClick={loadPendingUsers}
                className="rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700"
              >
                רענון
              </button>
            </div>

            {pendingError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                {pendingError}
              </div>
            )}

            {loadingPending ? (
              <div className="text-slate-500">טוען משתמשים...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-500">
                אין כרגע משתמשים שממתינים לאישור.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-right">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-sm">
                      <th className="py-3 px-2">שם מלא</th>
                      <th className="py-3 px-2">אימייל</th>
                      <th className="py-3 px-2">טלפון</th>
                      <th className="py-3 px-2">תפקיד מבוקש</th>
                      <th className="py-3 px-2">תפקיד לאישור</th>
                      <th className="py-3 px-2">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((pendingUser) => (
                      <tr
                        key={pendingUser._id}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 px-2">
                          {pendingUser.fullName || "—"}
                        </td>
                        <td className="py-3 px-2">
                          {pendingUser.email || "—"}
                        </td>
                        <td className="py-3 px-2">
                          {pendingUser.phone || "—"}
                        </td>
                        <td className="py-3 px-2">
                          {pendingUser.requestedRole || "tenant"}
                        </td>
                        <td className="py-3 px-2">
                          <select
                            defaultValue={pendingUser.requestedRole || "tenant"}
                            id={`approve-role-${pendingUser._id}`}
                            className="rounded-xl border border-slate-300 px-3 py-2"
                          >
                            {ROLE_OPTIONS.map((role) => (
                              <option key={role.value} value={role.value}>
                                {role.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                const selectedRole = document.getElementById(
                                  `approve-role-${pendingUser._id}`,
                                )?.value;
                                approveUser(pendingUser._id, selectedRole);
                              }}
                              className="rounded-xl bg-emerald-600 text-white px-3 py-2 text-sm hover:bg-emerald-700"
                            >
                              אשר
                            </button>

                            <button
                              type="button"
                              onClick={() => rejectUser(pendingUser._id)}
                              className="rounded-xl bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700"
                            >
                              דחה
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  ניהול משתמשים
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  חיפוש, סינון, שינוי תפקיד ומחיקת משתמשים.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="חיפוש לפי שם / אימייל / טלפון"
                  className="rounded-xl border border-slate-300 px-3 py-2.5 w-[260px]"
                />

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5"
                >
                  <option value="all">כל התפקידים</option>
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={loadUsers}
                  className="rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700"
                >
                  רענון
                </button>
              </div>
            </div>

            {usersError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                {usersError}
              </div>
            )}

            {loadingUsers ? (
              <div className="text-slate-500">טוען משתמשים...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-500">
                אין משתמשים להצגה.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1100px] text-right">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-sm">
                      <th className="py-3 px-2">שם מלא</th>
                      <th className="py-3 px-2">אימייל</th>
                      <th className="py-3 px-2">טלפון</th>
                      <th className="py-3 px-2">תפקיד</th>
                      <th className="py-3 px-2">מאושר</th>
                      <th className="py-3 px-2">נוצר בתאריך</th>
                      <th className="py-3 px-2">שינוי תפקיד</th>
                      <th className="py-3 px-2">מחיקה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((managedUser) => (
                      <tr
                        key={managedUser._id}
                        className="border-b border-slate-100"
                      >
                        <td className="py-3 px-2">
                          {managedUser.fullName || "—"}
                        </td>
                        <td className="py-3 px-2">
                          {managedUser.email || "—"}
                        </td>
                        <td className="py-3 px-2">
                          {managedUser.phone || "—"}
                        </td>
                        <td className="py-3 px-2">{managedUser.role || "—"}</td>
                        <td className="py-3 px-2">
                          {managedUser.isApproved ? "כן" : "לא"}
                        </td>
                        <td className="py-3 px-2">
                          {managedUser.createdAt
                            ? new Date(managedUser.createdAt).toLocaleString(
                                "he-IL",
                              )
                            : "—"}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2">
                            <select
                              defaultValue={managedUser.role || "tenant"}
                              id={`role-${managedUser._id}`}
                              className="rounded-xl border border-slate-300 px-3 py-2"
                            >
                              {ROLE_OPTIONS.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                const selectedRole = document.getElementById(
                                  `role-${managedUser._id}`,
                                )?.value;
                                updateUserRole(managedUser._id, selectedRole);
                              }}
                              className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm hover:bg-black"
                            >
                              שמור
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <button
                            type="button"
                            onClick={() => deleteUser(managedUser._id)}
                            className="rounded-xl bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700"
                          >
                            מחק
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "create" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 max-w-3xl">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">
              הוספת משתמש חדש
            </h2>
            <p className="text-sm text-slate-500 mb-5">
              יצירת משתמש חדש מתוך המערכת על ידי האדמין.
            </p>

            <form
              onSubmit={createUser}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">שם מלא</label>
                <input
                  value={newUser.fullName}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      fullName: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">אימייל</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">טלפון</label>
                <input
                  value={newUser.phone}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">סיסמה</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      password: e.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">תפקיד</label>
                <select
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser((prev) => ({ ...prev, role: e.target.value }))
                  }
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 mt-7">
                <input
                  id="isApproved"
                  type="checkbox"
                  checked={newUser.isApproved}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      isApproved: e.target.checked,
                    }))
                  }
                />
                <label htmlFor="isApproved" className="text-sm font-medium">
                  לאשר את המשתמש מיד
                </label>
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={creatingUser}
                  className="rounded-xl bg-emerald-600 text-white px-5 py-3 font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {creatingUser ? "יוצר..." : "צור משתמש"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
