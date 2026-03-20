import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import * as XLSX from "xlsx";

export default function CommitteeDashboard() {
  const [tab, setTab] = useState("home"); // home | faults | payments | announcements | chat | reports

  // faults
  const [faults, setFaults] = useState([]);
  const [faultsLoading, setFaultsLoading] = useState(true);
  const [faultsError, setFaultsError] = useState("");
  const [noteDrafts, setNoteDrafts] = useState({});

  // payments
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");

  // announcements
  const [announcements, setAnnouncements] = useState([]);
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [announcementsError, setAnnouncementsError] = useState("");
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
  const [announcementOk, setAnnouncementOk] = useState("");

  // building chat
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [chatError, setChatError] = useState("");
  const [chatText, setChatText] = useState("");
  const [sendingChat, setSendingChat] = useState(false);
  const [chatOk, setChatOk] = useState("");

  const statusLabel = (s) => {
    if (s === "open") return "פתוחה";
    if (s === "in_progress") return "בטיפול";
    if (s === "closed") return "סגורה";
    return s || "לא ידוע";
  };

  const paymentStatusLabel = (s) => {
    if (s === "paid") return "שולם";
    if (s === "refunded") return "זוכה";
    return s || "לא ידוע";
  };

  const formatDate = (value) => {
    if (!value) return "—";
    return new Date(value).toLocaleString("he-IL");
  };

  const statusBadgeClass = (status) => {
    if (status === "open") {
      return "bg-red-50 text-red-700 border border-red-200";
    }
    if (status === "in_progress") {
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    }
    if (status === "closed") {
      return "bg-green-50 text-green-700 border border-green-200";
    }
    return "bg-slate-100 text-slate-700 border border-slate-200";
  };

  // ---------- LOADERS ----------
  const loadFaults = async () => {
    setFaultsLoading(true);
    setFaultsError("");

    try {
      const res = await api.get("/api/faults/committee");
      setFaults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setFaultsError(
        "לא הצלחנו לטעון תקלות. ודא שיש הרשאת committee וששרת רץ.",
      );
      setFaults([]);
    } finally {
      setFaultsLoading(false);
    }
  };

  const loadPayments = async () => {
    setPaymentsLoading(true);
    setPaymentsError("");

    try {
      const res = await api.get("/api/payments/committee");
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const s = err?.response?.status;
      if (s === 404) {
        setPaymentsError(
          "הנתיב לתשלומים עדיין לא קיים בשרת. ודא ששינית את payment.routes.js לפי ההנחיות.",
        );
      } else {
        setPaymentsError(
          "לא הצלחנו לטעון תשלומים. ודא שיש הרשאת committee וששרת רץ.",
        );
      }
      setPayments([]);
    } finally {
      setPaymentsLoading(false);
    }
  };

  const loadAnnouncements = async () => {
    setAnnouncementsLoading(true);
    setAnnouncementsError("");

    try {
      const res = await api.get("/api/announcements/committee");
      setAnnouncements(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const s = err?.response?.status;
      if (s === 404) {
        setAnnouncementsError(
          "הודעות: הנתיב עדיין לא קיים בשרת. ודא שהוספת announcement.routes.js וחיברת ב-server.js.",
        );
      } else {
        setAnnouncementsError(
          "לא הצלחנו לטעון הודעות. ודא שיש הרשאת committee וששרת רץ.",
        );
      }
      setAnnouncements([]);
    } finally {
      setAnnouncementsLoading(false);
    }
  };

  const loadChat = async () => {
    setChatLoading(true);
    setChatError("");

    try {
      const res = await api.get("/api/messages/building");
      setChatMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const s = err?.response?.status;
      if (s === 404) {
        setChatError(
          "צ'אט דיירים: הנתיב עדיין לא קיים בשרת. ודא שחיברת message routes.",
        );
      } else {
        setChatError(
          "לא הצלחנו לטעון את צ'אט הדיירים. ודא שיש הרשאות ושהשרת רץ.",
        );
      }
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  useEffect(() => {
    loadFaults();
    loadPayments();
    loadAnnouncements();
    loadChat();
  }, []);

  // ---------- ACTIONS ----------
  const updateFault = async (faultId, payload) => {
    try {
      const res = await api.patch(`/api/faults/${faultId}`, payload);
      setFaults((prev) => prev.map((f) => (f._id === faultId ? res.data : f)));

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

  const sendAnnouncement = async (e) => {
    e.preventDefault();
    setAnnouncementOk("");
    setAnnouncementsError("");

    if (!msgTitle.trim() || !msgBody.trim()) {
      setAnnouncementsError("נא למלא כותרת ותוכן הודעה.");
      return;
    }

    setSendingAnnouncement(true);
    try {
      await api.post("/api/announcements/committee", {
        title: msgTitle.trim(),
        body: msgBody.trim(),
      });

      setMsgTitle("");
      setMsgBody("");
      setAnnouncementOk("ההודעה נשלחה בהצלחה.");
      await loadAnnouncements();
    } catch (err) {
      setAnnouncementsError(
        err?.response?.data?.message || "שליחת ההודעה נכשלה.",
      );
    } finally {
      setSendingAnnouncement(false);
    }
  };

  const sendChatMessage = async (e) => {
    e.preventDefault();
    setChatOk("");
    setChatError("");

    if (!chatText.trim()) {
      setChatError("נא לכתוב הודעה.");
      return;
    }

    setSendingChat(true);
    try {
      await api.post("/api/messages", {
        text: chatText.trim(),
      });
      setChatText("");
      setChatOk("ההודעה נשלחה לצ'אט.");
      await loadChat();
    } catch (err) {
      setChatError(err?.response?.data?.message || "שליחת ההודעה נכשלה.");
    } finally {
      setSendingChat(false);
    }
  };

  // ---------- EXPORTS ----------
  const exportFaultsToExcel = () => {
    const rows = faults.map((f) => ({
      כותרת: f.title || "",
      תיאור: f.description || "",
      סטטוס: statusLabel(f.status),
      "הערת ועד": f.adminNote || "",
      "תאריך פתיחה": formatDate(f.createdAt),
      "תאריך עדכון": formatDate(f.updatedAt),
      "היסטוריית טיפול":
        Array.isArray(f.history) && f.history.length > 0
          ? f.history
              .map(
                (h) =>
                  `${h.text} | ${h.byName || "מערכת"} | ${formatDate(h.createdAt)}`,
              )
              .join(" || ")
          : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Faults");
    XLSX.writeFile(workbook, "committee_faults.xlsx");
  };

  const exportPaymentsToExcel = () => {
    const rows = payments.map((p) => ({
      דייר: p.tenantId?.fullName || "",
      אימייל: p.tenantId?.email || "",
      חודש: p.monthKey || "",
      עיר: p.city || "",
      סכום: Number(p.amount || 0),
      סטטוס: paymentStatusLabel(p.status),
      תאריך: formatDate(p.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    XLSX.writeFile(workbook, "committee_payments.xlsx");
  };

  // ---------- SUMMARY ----------
  const openFaultsCount = useMemo(
    () => faults.filter((f) => f.status === "open").length,
    [faults],
  );

  const inProgressFaultsCount = useMemo(
    () => faults.filter((f) => f.status === "in_progress").length,
    [faults],
  );

  const closedFaultsCount = useMemo(
    () => faults.filter((f) => f.status === "closed").length,
    [faults],
  );

  const totalPaymentsAmount = useMemo(
    () =>
      payments
        .filter((p) => p.status === "paid")
        .reduce((sum, p) => sum + Number(p.amount || 0), 0),
    [payments],
  );

  const latestActivities = useMemo(() => {
    const faultActivities = faults.map((f) => ({
      id: `fault-${f._id}`,
      type: "fault",
      title: `תקלה: ${f.title}`,
      subtitle: `סטטוס: ${statusLabel(f.status)}`,
      date: f.updatedAt || f.createdAt,
    }));

    const paymentActivities = payments.map((p) => ({
      id: `payment-${p._id}`,
      type: "payment",
      title: `תשלום: ₪${Number(p.amount || 0).toLocaleString("he-IL")}`,
      subtitle: `${p.tenantId?.fullName || "דייר"} • ${p.monthKey || ""}`,
      date: p.createdAt,
    }));

    const announcementActivities = announcements.map((m) => ({
      id: `announcement-${m._id}`,
      type: "announcement",
      title: `הודעת ועד: ${m.title}`,
      subtitle: m.createdByName || "ועד הבית",
      date: m.createdAt,
    }));

    const chatActivities = chatMessages.map((m) => ({
      id: `chat-${m._id}`,
      type: "chat",
      title: `צ'אט: ${m.senderName || "משתמש"}`,
      subtitle: m.text || "",
      date: m.createdAt,
    }));

    return [
      ...faultActivities,
      ...paymentActivities,
      ...announcementActivities,
      ...chatActivities,
    ]
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [faults, payments, announcements, chatMessages]);

  // ---------- UI HELPERS ----------
  const tabBtn = (key, label) => {
    const active = tab === key;
    return (
      <button
        type="button"
        onClick={() => setTab(key)}
        className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
          active
            ? "bg-slate-900 text-white shadow-sm"
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">אזור ועד</h1>
          <p className="text-slate-600">
            דשבורד ניהול מרכזי לוועד הבית – תקלות, תשלומים, הודעות ודוחות.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap mb-6">
          {tabBtn("home", "דף הבית")}
          {tabBtn("faults", "ניהול תקלות")}
          {tabBtn("payments", "היסטוריית תשלומים")}
          {tabBtn("announcements", "הודעות לדיירים")}
          {tabBtn("chat", "צ'אט דיירים")}
          {tabBtn("reports", "דוחות וייצוא")}
        </div>

        {/* -------- TAB: HOME -------- */}
        {tab === "home" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              {summaryCard("תקלות פתוחות", openFaultsCount)}
              {summaryCard("תקלות בטיפול", inProgressFaultsCount)}
              {summaryCard("תקלות סגורות", closedFaultsCount)}
              {summaryCard(
                "סה״כ תשלומים",
                `₪${totalPaymentsAmount.toLocaleString("he-IL")}`,
              )}
              {summaryCard("הודעות ועד", announcements.length)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      פעילות אחרונה
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      הפעולות האחרונות בבניין שלך.
                    </p>
                  </div>
                </div>

                {latestActivities.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-500">
                    עדיין אין פעילות להצגה.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {latestActivities.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {item.title}
                            </p>
                            <p className="text-sm text-slate-600 mt-1">
                              {item.subtitle}
                            </p>
                          </div>
                          <div className="text-xs text-slate-500 whitespace-nowrap">
                            {formatDate(item.date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <h2 className="text-xl font-semibold text-slate-900 mb-4">
                  פעולות מהירות
                </h2>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() => setTab("faults")}
                    className="w-full rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 transition"
                  >
                    עבור לניהול תקלות
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab("payments")}
                    className="w-full rounded-xl bg-white border border-slate-300 text-slate-800 py-3 font-medium hover:bg-slate-50 transition"
                  >
                    עבור לתשלומים
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab("announcements")}
                    className="w-full rounded-xl bg-white border border-slate-300 text-slate-800 py-3 font-medium hover:bg-slate-50 transition"
                  >
                    שלח הודעת ועד
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab("reports")}
                    className="w-full rounded-xl bg-emerald-600 text-white py-3 font-medium hover:bg-emerald-700 transition"
                  >
                    דוחות וייצוא
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------- TAB: FAULTS -------- */}
        {tab === "faults" && (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  ניהול תקלות
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  צפייה, שינוי סטטוס והוספת הערת ועד.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportFaultsToExcel}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  ייצוא תקלות לאקסל
                </button>
                <button
                  onClick={loadFaults}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  רענון
                </button>
              </div>
            </div>

            {faultsError && (
              <div className="bg-white border border-red-200 text-red-700 p-3 rounded-2xl mb-4">
                {faultsError}
              </div>
            )}

            {faultsLoading ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                טוען...
              </div>
            ) : faults.length === 0 ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                אין תקלות להצגה.
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-right min-w-[1100px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3">כותרת</th>
                      <th className="p-3">תיאור</th>
                      <th className="p-3">סטטוס</th>
                      <th className="p-3">שינוי סטטוס</th>
                      <th className="p-3">הערת ועד</th>
                      <th className="p-3">עדכון הערה</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faults.map((f) => (
                      <tr
                        key={f._id}
                        className="border-b border-slate-100 align-top"
                      >
                        <td className="p-3 font-medium text-slate-900">
                          {f.title}
                        </td>
                        <td className="p-3 text-slate-700">{f.description}</td>

                        <td className="p-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-sm ${statusBadgeClass(
                              f.status,
                            )}`}
                          >
                            {statusLabel(f.status)}
                          </span>
                        </td>

                        <td className="p-3">
                          <select
                            value={f.status}
                            onChange={(e) =>
                              updateFault(f._id, { status: e.target.value })
                            }
                            className="border border-slate-300 rounded-xl px-3 py-2"
                          >
                            <option value="open">פתוחה</option>
                            <option value="in_progress">בטיפול</option>
                            <option value="closed">סגורה</option>
                          </select>
                        </td>

                        <td className="p-3">
                          <div className="text-sm text-slate-700">
                            {f.adminNote ? (
                              f.adminNote
                            ) : (
                              <span className="text-slate-400">אין הערה</span>
                            )}
                          </div>
                        </td>

                        <td className="p-3">
                          <textarea
                            className="w-72 border border-slate-300 rounded-xl px-3 py-2 text-sm"
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
                            className="mt-2 px-3 py-2 rounded-xl bg-slate-900 text-white hover:bg-black text-sm"
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
          </>
        )}

        {/* -------- TAB: PAYMENTS -------- */}
        {tab === "payments" && (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  היסטוריית תשלומים
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  כל התשלומים שהתקבלו מהדיירים בבניין.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={exportPaymentsToExcel}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  ייצוא תשלומים לאקסל
                </button>
                <button
                  onClick={loadPayments}
                  className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                >
                  רענון
                </button>
              </div>
            </div>

            {paymentsError && (
              <div className="bg-white border border-red-200 text-red-700 p-3 rounded-2xl mb-4">
                {paymentsError}
              </div>
            )}

            {paymentsLoading ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                טוען...
              </div>
            ) : payments.length === 0 ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                אין תשלומים להצגה כרגע.
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-right min-w-[900px]">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="p-3">דייר</th>
                      <th className="p-3">אימייל</th>
                      <th className="p-3">חודש</th>
                      <th className="p-3">עיר</th>
                      <th className="p-3">סכום</th>
                      <th className="p-3">סטטוס</th>
                      <th className="p-3">תאריך</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p._id} className="border-b border-slate-100">
                        <td className="p-3">{p.tenantId?.fullName || "—"}</td>
                        <td className="p-3">{p.tenantId?.email || "—"}</td>
                        <td className="p-3">{p.monthKey || "—"}</td>
                        <td className="p-3">{p.city || "—"}</td>
                        <td className="p-3 font-semibold">
                          ₪{Number(p.amount || 0).toLocaleString("he-IL")}
                        </td>
                        <td className="p-3">{paymentStatusLabel(p.status)}</td>
                        <td className="p-3 text-sm text-slate-600">
                          {formatDate(p.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* -------- TAB: ANNOUNCEMENTS -------- */}
        {tab === "announcements" && (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  הודעות לדיירים
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  שליחת הודעות רשמיות שיקפצו לדיירים בדשבורד.
                </p>
              </div>

              <button
                onClick={loadAnnouncements}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                רענון
              </button>
            </div>

            {announcementsError && (
              <div className="bg-white border border-red-200 text-red-700 p-3 rounded-2xl mb-4">
                {announcementsError}
              </div>
            )}

            {announcementOk && (
              <div className="bg-white border border-emerald-200 text-emerald-800 p-3 rounded-2xl mb-4">
                {announcementOk}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
              <h3 className="font-bold mb-3 text-slate-900">
                שליחת הודעה חדשה
              </h3>
              <form onSubmit={sendAnnouncement} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    כותרת
                  </label>
                  <input
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5"
                    value={msgTitle}
                    onChange={(e) => setMsgTitle(e.target.value)}
                    placeholder="לדוגמה: עדכון תחזוקה"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">תוכן</label>
                  <textarea
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5"
                    rows={4}
                    value={msgBody}
                    onChange={(e) => setMsgBody(e.target.value)}
                    placeholder="כתוב הודעה מסודרת לדיירים..."
                  />
                </div>
                <button
                  disabled={sendingAnnouncement}
                  className="bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-black disabled:opacity-60"
                >
                  {sendingAnnouncement ? "שולח..." : "שלח הודעה"}
                </button>
              </form>
            </div>

            {announcementsLoading ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                טוען...
              </div>
            ) : announcements.length === 0 ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                אין הודעות להצגה.
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((m) => (
                  <div
                    key={m._id}
                    className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4"
                  >
                    <div className="font-bold text-slate-900">{m.title}</div>
                    <div className="text-slate-700 mt-2 whitespace-pre-line">
                      {m.body}
                    </div>
                    <div className="text-xs text-slate-500 mt-3">
                      {m.createdAt ? formatDate(m.createdAt) : ""}
                      {m.createdByName ? ` • נשלח ע"י: ${m.createdByName}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* -------- TAB: CHAT -------- */}
        {tab === "chat" && (
          <>
            <div className="flex items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  צ'אט דיירים
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  צפייה בשיח הבניין ושליחת הודעה ישירה לצ'אט.
                </p>
              </div>

              <button
                onClick={loadChat}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              >
                רענון
              </button>
            </div>

            {chatError && (
              <div className="bg-white border border-red-200 text-red-700 p-3 rounded-2xl mb-4">
                {chatError}
              </div>
            )}

            {chatOk && (
              <div className="bg-white border border-emerald-200 text-emerald-800 p-3 rounded-2xl mb-4">
                {chatOk}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 mb-6">
              <h3 className="font-bold mb-3 text-slate-900">
                שליחת הודעה לצ'אט
              </h3>
              <form onSubmit={sendChatMessage} className="flex gap-2">
                <input
                  className="flex-1 border border-slate-300 rounded-xl px-3 py-2.5"
                  value={chatText}
                  onChange={(e) => setChatText(e.target.value)}
                  placeholder="כתוב הודעה לדיירי הבניין..."
                />
                <button
                  disabled={sendingChat}
                  className="bg-slate-900 text-white px-4 py-2.5 rounded-xl hover:bg-black disabled:opacity-60"
                >
                  {sendingChat ? "שולח..." : "שלח"}
                </button>
              </form>
            </div>

            {chatLoading ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                טוען...
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                אין הודעות בצ'אט כרגע.
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
                <div className="space-y-3 max-h-[500px] overflow-y-auto">
                  {chatMessages.map((m) => (
                    <div
                      key={m._id}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="text-sm font-semibold text-slate-900">
                        {m.senderName || "משתמש"}
                      </div>
                      <div className="text-sm text-slate-700 mt-1 whitespace-pre-line">
                        {m.text}
                      </div>
                      <div className="text-xs text-slate-500 mt-2">
                        {formatDate(m.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* -------- TAB: REPORTS -------- */}
        {tab === "reports" && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                דוחות וייצוא
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                מכאן ניתן להוריד קבצי אקסל לצורך בקרה, הצגה או הגשה.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    דוח תקלות
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    כולל כותרת, תיאור, סטטוס, הערות ועד והיסטוריית טיפול.
                  </p>
                  <button
                    onClick={exportFaultsToExcel}
                    className="rounded-xl bg-emerald-600 text-white px-4 py-2.5 hover:bg-emerald-700"
                  >
                    ייצוא תקלות לאקסל
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    דוח תשלומים
                  </h3>
                  <p className="text-sm text-slate-600 mb-4">
                    כולל דייר, אימייל, חודש, עיר, סכום, סטטוס ותאריך תשלום.
                  </p>
                  <button
                    onClick={exportPaymentsToExcel}
                    className="rounded-xl bg-emerald-600 text-white px-4 py-2.5 hover:bg-emerald-700"
                  >
                    ייצוא תשלומים לאקסל
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
