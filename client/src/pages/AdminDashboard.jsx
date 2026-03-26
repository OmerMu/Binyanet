import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const ROLE_OPTIONS = [
  { value: "tenant", label: "דייר" },
  { value: "committee", label: "חבר ועד" },
  { value: "company", label: "חברה" },
  { value: "admin", label: "אדמין" },
];

const LEAD_STATUS_OPTIONS = [
  { value: "new", label: "חדש" },
  { value: "in_progress", label: "בטיפול" },
  { value: "done", label: "סיום טיפול" },
];

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");

  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [leads, setLeads] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingLeads, setLoadingLeads] = useState(true);

  const [usersError, setUsersError] = useState("");
  const [pendingError, setPendingError] = useState("");
  const [leadsError, setLeadsError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStatusFilter, setLeadStatusFilter] = useState("all");

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
    loadLeads();
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

  const loadLeads = async () => {
    setLoadingLeads(true);
    setLeadsError("");

    try {
      const res = await api.get("/api/leads");
      setLeads(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setLeads([]);
      setLeadsError("לא הצלחנו לטעון את הלידים.");
    } finally {
      setLoadingLeads(false);
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

  const updateLeadStatus = async (leadId, status) => {
    setSuccessMessage("");
    try {
      await api.patch(`/api/leads/${leadId}/status`, { status });
      setSuccessMessage("סטטוס הליד עודכן בהצלחה.");
      await loadLeads();
    } catch (err) {
      alert(err?.response?.data?.message || "עדכון סטטוס הליד נכשל.");
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

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const text =
        `${lead.fullName || ""} ${lead.phone || ""} ${lead.email || ""} ${lead.buildingSize || ""} ${lead.message || ""}`.toLowerCase();

      const matchesSearch = text.includes(leadSearch.toLowerCase());
      const matchesStatus =
        leadStatusFilter === "all" ? true : lead.status === leadStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [leads, leadSearch, leadStatusFilter]);

  const counts = useMemo(() => {
    return {
      total: users.length,
      pending: pendingUsers.length,
      admins: users.filter((u) => u.role === "admin").length,
      companies: users.filter((u) => u.role === "company").length,
      committees: users.filter((u) => u.role === "committee").length,
      tenants: users.filter((u) => u.role === "tenant").length,
      leads: leads.length,
      newLeads: leads.filter((lead) => lead.status === "new").length,
    };
  }, [users, pendingUsers, leads]);

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

  const leadStatusLabel = (status) => {
    return (
      LEAD_STATUS_OPTIONS.find((item) => item.value === status)?.label || status
    );
  };
  const leadStatusClass = (status) => {
    if (status === "new") {
      return "bg-red-100 text-red-700 border border-red-200";
    }

    if (status === "in_progress") {
      return "bg-blue-100 text-blue-700 border border-blue-200";
    }

    if (status === "done") {
      return "bg-green-100 text-green-700 border border-green-200";
    }

    return "bg-slate-100 text-slate-700 border border-slate-200";
  };

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

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-8 gap-4 mb-8">
          {summaryCard("סה״כ משתמשים", counts.total)}
          {summaryCard("ממתינים לאישור", counts.pending)}
          {summaryCard("אדמינים", counts.admins)}
          {summaryCard("חברות", counts.companies)}
          {summaryCard("חברי ועד", counts.committees)}
          {summaryCard("דיירים", counts.tenants)}
          {summaryCard("סה״כ לידים", counts.leads)}
          {summaryCard("לידים חדשים", counts.newLeads)}
        </div>

        <div className="flex flex-wrap gap-3 mb-8">
          {tabButton("home", "דף הבית")}
          {tabButton("pending", "ממתינים לאישור")}
          {tabButton("users", "משתמשים")}
          {tabButton("create", "יצירת משתמש")}
          {tabButton("leads", "לידים")}
        </div>

        {tab === "home" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:col-span-2">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                סקירה מהירה
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => setTab("pending")}
                  className="text-right rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
                >
                  <div className="text-sm text-slate-500">ממתינים לאישור</div>
                  <div className="text-3xl font-bold text-slate-900 mt-2">
                    {pendingUsers.length}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("users")}
                  className="text-right rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
                >
                  <div className="text-sm text-slate-500">משתמשים פעילים</div>
                  <div className="text-3xl font-bold text-slate-900 mt-2">
                    {users.length}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTab("leads")}
                  className="text-right rounded-2xl border border-slate-200 bg-slate-50 p-5 hover:bg-slate-100 transition"
                >
                  <div className="text-sm text-slate-500">לידים מהאתר</div>
                  <div className="text-3xl font-bold text-slate-900 mt-2">
                    {leads.length}
                  </div>
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">
                סטטוס לידים
              </h2>

              <div className="space-y-4">
                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-between">
                  <span>חדשים</span>
                  <span className="font-bold text-slate-900">
                    {leads.filter((lead) => lead.status === "new").length}
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-between">
                  <span>בטיפול</span>
                  <span className="font-bold text-slate-900">
                    {
                      leads.filter((lead) => lead.status === "in_progress")
                        .length
                    }
                  </span>
                </div>

                <div className="rounded-2xl bg-slate-50 border border-slate-200 px-4 py-3 flex items-center justify-between">
                  <span>סיום טיפול</span>
                  <span className="font-bold text-slate-900">
                    {leads.filter((lead) => lead.status === "done").length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "pending" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  משתמשים ממתינים לאישור
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  כאן ניתן לאשר משתמשים חדשים ולבחור את התפקיד שלהם.
                </p>
              </div>

              <button
                type="button"
                onClick={loadPendingUsers}
                className="rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700"
              >
                רענן
              </button>
            </div>

            {pendingError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                {pendingError}
              </div>
            )}

            {loadingPending ? (
              <div className="text-slate-500">טוען משתמשים ממתינים...</div>
            ) : pendingUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-500">
                אין משתמשים ממתינים כרגע.
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
                      <th className="py-3 px-2">נוצר בתאריך</th>
                      <th className="py-3 px-2">פעולות</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u._id} className="border-b border-slate-100">
                        <td className="py-3 px-2">{u.fullName || "—"}</td>
                        <td className="py-3 px-2">{u.email || "—"}</td>
                        <td className="py-3 px-2">{u.phone || "—"}</td>
                        <td className="py-3 px-2">{u.role || "—"}</td>
                        <td className="py-3 px-2">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleString("he-IL")
                            : "—"}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2 flex-wrap">
                            <select
                              defaultValue={u.role}
                              id={`user-role-${u._id}`}
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
                                  `user-role-${u._id}`,
                                )?.value;
                                updateUserRole(u._id, selectedRole);
                              }}
                              className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm hover:bg-black"
                            >
                              שמור תפקיד
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteUser(u._id)}
                              className="rounded-xl bg-red-600 text-white px-3 py-2 text-sm hover:bg-red-700"
                            >
                              מחק
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

        {tab === "create" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">
                יצירת משתמש חדש
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                ניתן ליצור כאן משתמש באופן יזום מתוך המערכת.
              </p>
            </div>

            <form
              onSubmit={createUser}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <input
                type="text"
                placeholder="שם מלא"
                value={newUser.fullName}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, fullName: e.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2.5"
                required
              />

              <input
                type="email"
                placeholder="אימייל"
                value={newUser.email}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, email: e.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2.5"
                required
              />

              <input
                type="text"
                placeholder="טלפון"
                value={newUser.phone}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2.5"
                required
              />

              <input
                type="password"
                placeholder="סיסמה"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, password: e.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2.5"
                required
              />

              <select
                value={newUser.role}
                onChange={(e) =>
                  setNewUser((prev) => ({ ...prev, role: e.target.value }))
                }
                className="rounded-xl border border-slate-300 px-3 py-2.5"
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2.5">
                <input
                  type="checkbox"
                  checked={newUser.isApproved}
                  onChange={(e) =>
                    setNewUser((prev) => ({
                      ...prev,
                      isApproved: e.target.checked,
                    }))
                  }
                />
                <span>לאשר את המשתמש מיד</span>
              </label>

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

        {tab === "leads" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">לידים</h2>
                <p className="text-sm text-slate-500 mt-1">
                  כל הפניות שהושארו בטופס האתר.
                </p>
              </div>

              <div className="flex gap-3 flex-wrap">
                <input
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                  placeholder="חיפוש לפי שם / טלפון / אימייל"
                  className="rounded-xl border border-slate-300 px-3 py-2.5 w-[260px]"
                />

                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5"
                >
                  <option value="all">כל הסטטוסים</option>
                  {LEAD_STATUS_OPTIONS.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={loadLeads}
                  className="rounded-xl bg-blue-600 text-white px-4 py-2.5 hover:bg-blue-700"
                >
                  רענון
                </button>
              </div>
            </div>

            {leadsError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3">
                {leadsError}
              </div>
            )}

            {loadingLeads ? (
              <div className="text-slate-500">טוען לידים...</div>
            ) : filteredLeads.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-500">
                אין לידים להצגה.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1250px] text-right">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 text-sm">
                      <th className="py-3 px-2">שם מלא</th>
                      <th className="py-3 px-2">טלפון</th>
                      <th className="py-3 px-2">אימייל</th>
                      <th className="py-3 px-2">גודל בניין</th>
                      <th className="py-3 px-2">הודעה</th>
                      <th className="py-3 px-2">סטטוס</th>
                      <th className="py-3 px-2">נוצר בתאריך</th>
                      <th className="py-3 px-2">עדכון סטטוס</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id} className="border-b border-slate-100">
                        <td className="py-3 px-2">{lead.fullName || "—"}</td>
                        <td className="py-3 px-2">{lead.phone || "—"}</td>
                        <td className="py-3 px-2">{lead.email || "—"}</td>
                        <td className="py-3 px-2">
                          {lead.buildingSize || "—"}
                        </td>
                        <td className="py-3 px-2 max-w-[300px]">
                          <div className="whitespace-pre-wrap break-words">
                            {lead.message || "—"}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${leadStatusClass(
                              lead.status,
                            )}`}
                          >
                            {leadStatusLabel(lead.status)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {lead.createdAt
                            ? new Date(lead.createdAt).toLocaleString("he-IL")
                            : "—"}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-2 flex-wrap">
                            <select
                              defaultValue={lead.status || "new"}
                              id={`lead-status-${lead._id}`}
                              className="rounded-xl border border-slate-300 px-3 py-2"
                            >
                              {LEAD_STATUS_OPTIONS.map((status) => (
                                <option key={status.value} value={status.value}>
                                  {status.label}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                const selectedStatus = document.getElementById(
                                  `lead-status-${lead._id}`,
                                )?.value;
                                updateLeadStatus(lead._id, selectedStatus);
                              }}
                              className="rounded-xl bg-slate-900 text-white px-3 py-2 text-sm hover:bg-black"
                            >
                              שמור סטטוס
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
      </div>
    </div>
  );
}
