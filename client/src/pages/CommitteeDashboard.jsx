import { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function CommitteeDashboard() {
  const [tab, setTab] = useState("faults"); // faults | payments | messages

  // faults
  const [faults, setFaults] = useState([]);
  const [faultsLoading, setFaultsLoading] = useState(true);
  const [faultsError, setFaultsError] = useState("");
  const [noteDrafts, setNoteDrafts] = useState({});

  // payments
  const [payments, setPayments] = useState([]);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [paymentsError, setPaymentsError] = useState("");

  // messages (announcements)
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState("");
  const [msgTitle, setMsgTitle] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgOk, setMsgOk] = useState("");

  const statusLabel = (s) => {
    if (s === "open") return "פתוחה";
    if (s === "in_progress") return "בטיפול";
    if (s === "closed") return "סגורה";
    return s;
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

  const loadMessages = async () => {
    setMessagesLoading(true);
    setMessagesError("");
    try {
      const res = await api.get("/api/announcements/committee");
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const s = err?.response?.status;
      if (s === 404) {
        setMessagesError(
          "הודעות: הנתיב עדיין לא קיים בשרת. ודא שהוספת announcement.routes.js וחיברת ב-server.js.",
        );
      } else {
        setMessagesError(
          "לא הצלחנו לטעון הודעות. ודא שיש הרשאת committee וששרת רץ.",
        );
      }
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    loadFaults(); // טאב ברירת מחדל
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // כשעוברים טאב – נטען אם עוד לא נטען/או לרענון ראשון
  useEffect(() => {
    if (tab === "payments" && payments.length === 0) loadPayments();
    if (tab === "messages" && messages.length === 0) loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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

  const sendMessage = async (e) => {
    e.preventDefault();
    setMsgOk("");
    setMessagesError("");

    if (!msgTitle.trim() || !msgBody.trim()) {
      setMessagesError("נא למלא כותרת ותוכן הודעה.");
      return;
    }

    setSendingMsg(true);
    try {
      await api.post("/api/announcements/committee", {
        title: msgTitle.trim(),
        body: msgBody.trim(),
      });
      setMsgTitle("");
      setMsgBody("");
      setMsgOk("ההודעה נשלחה בהצלחה.");
      await loadMessages();
    } catch (err) {
      setMessagesError(err?.response?.data?.message || "שליחת ההודעה נכשלה.");
    } finally {
      setSendingMsg(false);
    }
  };

  // ---------- UI HELPERS ----------
  const tabBtn = (key, label) => {
    const active = tab === key;
    return (
      <button
        onClick={() => setTab(key)}
        className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
          active ? "bg-gray-900 text-white" : "bg-white border hover:bg-gray-50"
        }`}
      >
        {label}
      </button>
    );
  };

  const paymentsRows = useMemo(() => payments, [payments]);

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-800" dir="rtl">
      <div className="flex flex-col gap-3 mb-4">
        <h1 className="text-3xl font-bold">אזור ועד</h1>

        <div className="flex gap-2 flex-wrap">
          {tabBtn("faults", "ניהול תקלות")}
          {tabBtn("payments", "היסטוריית תשלומים")}
          {tabBtn("messages", "הודעות לדיירים")}
        </div>
      </div>

      {/* -------- TAB: FAULTS -------- */}
      {tab === "faults" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">תקלות</h2>
            <button
              onClick={loadFaults}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              רענון
            </button>
          </div>

          {faultsError && (
            <div className="bg-white border border-red-200 text-red-700 p-3 rounded mb-4">
              {faultsError}
            </div>
          )}

          {faultsLoading ? (
            <div className="bg-white p-4 rounded shadow">טוען...</div>
          ) : faults.length === 0 ? (
            <div className="bg-white p-4 rounded shadow">אין תקלות להצגה.</div>
          ) : (
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b">
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
                    <tr key={f._id} className="border-b align-top">
                      <td className="p-3 font-medium">{f.title}</td>
                      <td className="p-3 text-gray-700">{f.description}</td>

                      <td className="p-3">
                        <span className="px-2 py-1 rounded text-sm bg-gray-100">
                          {statusLabel(f.status)}
                        </span>
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
        </>
      )}

      {/* -------- TAB: PAYMENTS -------- */}
      {tab === "payments" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">היסטוריית תשלומים</h2>
            <button
              onClick={loadPayments}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              רענון
            </button>
          </div>

          {paymentsError && (
            <div className="bg-white border border-red-200 text-red-700 p-3 rounded mb-4">
              {paymentsError}
            </div>
          )}

          {paymentsLoading ? (
            <div className="bg-white p-4 rounded shadow">טוען...</div>
          ) : paymentsRows.length === 0 ? (
            <div className="bg-white p-4 rounded shadow">
              אין תשלומים להצגה כרגע.
            </div>
          ) : (
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="w-full text-right">
                <thead className="bg-gray-50 border-b">
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
                  {paymentsRows.map((p) => (
                    <tr key={p._id} className="border-b">
                      <td className="p-3">{p.tenantId?.fullName || "—"}</td>
                      <td className="p-3">{p.tenantId?.email || "—"}</td>
                      <td className="p-3">{p.monthKey || "—"}</td>
                      <td className="p-3">{p.city || "—"}</td>
                      <td className="p-3 font-semibold">{p.amount ?? "—"}</td>
                      <td className="p-3">{p.status || "—"}</td>
                      <td className="p-3 text-sm text-gray-600">
                        {p.createdAt
                          ? new Date(p.createdAt).toLocaleString("he-IL")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* -------- TAB: MESSAGES -------- */}
      {tab === "messages" && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">הודעות לדיירים</h2>
            <button
              onClick={loadMessages}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              רענון
            </button>
          </div>

          {messagesError && (
            <div className="bg-white border border-red-200 text-red-700 p-3 rounded mb-4">
              {messagesError}
            </div>
          )}
          {msgOk && (
            <div className="bg-white border border-emerald-200 text-emerald-800 p-3 rounded mb-4">
              {msgOk}
            </div>
          )}

          <div className="bg-white rounded shadow p-4 mb-6">
            <h3 className="font-bold mb-3">שליחת הודעה חדשה</h3>
            <form onSubmit={sendMessage} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">כותרת</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={msgTitle}
                  onChange={(e) => setMsgTitle(e.target.value)}
                  placeholder="לדוגמה: עדכון תחזוקה"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">תוכן</label>
                <textarea
                  className="w-full border rounded px-3 py-2"
                  rows={4}
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="כתוב הודעה מסודרת לדיירים..."
                />
              </div>
              <button
                disabled={sendingMsg}
                className="bg-gray-900 text-white px-4 py-2 rounded hover:bg-black disabled:opacity-60"
              >
                {sendingMsg ? "שולח..." : "שלח הודעה"}
              </button>
            </form>
          </div>

          {messagesLoading ? (
            <div className="bg-white p-4 rounded shadow">טוען...</div>
          ) : messages.length === 0 ? (
            <div className="bg-white p-4 rounded shadow">אין הודעות להצגה.</div>
          ) : (
            <div className="space-y-3">
              {messages.map((m) => (
                <div key={m._id} className="bg-white rounded shadow p-4">
                  <div className="font-bold">{m.title}</div>
                  <div className="text-gray-700 mt-2 whitespace-pre-line">
                    {m.body}
                  </div>
                  <div className="text-xs text-gray-500 mt-3">
                    {m.createdAt
                      ? new Date(m.createdAt).toLocaleString("he-IL")
                      : ""}
                    {m.createdByName ? ` • נשלח ע"י: ${m.createdByName}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
