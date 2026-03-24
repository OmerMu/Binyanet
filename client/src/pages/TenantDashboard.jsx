import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function TenantDashboard() {
  const [user, setUser] = useState(null);

  const [faults, setFaults] = useState([]);
  const [payments, setPayments] = useState([]);
  const [messages, setMessages] = useState([]);

  const [announcements, setAnnouncements] = useState([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [announcementError, setAnnouncementError] = useState("");
  const [announcementPopup, setAnnouncementPopup] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentCity, setPaymentCity] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("credit");

  const [messageText, setMessageText] = useState("");

  const [loadingFaults, setLoadingFaults] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);

  const [submittingFault, setSubmittingFault] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [submittingMessage, setSubmittingMessage] = useState(false);

  const [faultError, setFaultError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [messageError, setMessageError] = useState("");

  const [faultSuccess, setFaultSuccess] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState("");
  const [messageSuccess, setMessageSuccess] = useState("");

  const navigate = useNavigate();
  const handledPayPalRef = useRef(false);

  const getReadAnnouncementIds = () => {
    try {
      return JSON.parse(localStorage.getItem("readAnnouncementIds") || "[]");
    } catch {
      return [];
    }
  };

  const setReadAnnouncementIds = (ids) => {
    localStorage.setItem("readAnnouncementIds", JSON.stringify(ids));
  };

  const markAnnouncementAsRead = (announcementId) => {
    if (!announcementId) return;

    const readIds = getReadAnnouncementIds();
    if (!readIds.includes(announcementId)) {
      setReadAnnouncementIds([...readIds, announcementId]);
    }

    if (announcementPopup?._id === announcementId) {
      setAnnouncementPopup(null);
    }
  };

  const markAllAnnouncementsAsRead = () => {
    const ids = announcements.map((item) => item._id).filter(Boolean);
    setReadAnnouncementIds(ids);
    setAnnouncementPopup(null);
  };

  const isAnnouncementRead = (announcementId) => {
    return getReadAnnouncementIds().includes(announcementId);
  };

  const statusLabel = (status) => {
    if (status === "open") return "פתוחה";
    if (status === "in_progress") return "בטיפול";
    if (status === "closed") return "סגורה";
    return status || "לא ידוע";
  };

  const statusBadgeClass = (status) => {
    if (status === "open")
      return "bg-red-50 text-red-700 border border-red-200";
    if (status === "in_progress")
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    if (status === "closed")
      return "bg-green-50 text-green-700 border border-green-200";
    return "bg-gray-50 text-gray-700 border border-gray-200";
  };

  const paymentStatusLabel = (status) => {
    if (status === "paid") return "שולם";
    if (status === "refunded") return "זוכה";
    return status || "לא ידוע";
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("he-IL");
  };

  const getCurrentMonthKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
  };

  const loadMyFaults = async () => {
    setLoadingFaults(true);
    setFaultError("");

    try {
      const res = await api.get("/api/faults/my");
      setFaults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setFaultError("פג תוקף ההתחברות. יש להתחבר מחדש.");
      } else if (status === 403) {
        setFaultError("אין לך הרשאה לצפות בתקלות.");
      } else {
        setFaultError("לא הצלחנו לטעון את התקלות.");
      }
    } finally {
      setLoadingFaults(false);
    }
  };

  const loadMyPayments = async () => {
    setLoadingPayments(true);
    setPaymentError("");

    try {
      const res = await api.get("/api/payments/my");
      setPayments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setPaymentError("פג תוקף ההתחברות. יש להתחבר מחדש.");
      } else if (status === 403) {
        setPaymentError("אין לך הרשאה לצפות בתשלומים.");
      } else {
        setPaymentError("לא הצלחנו לטעון את התשלומים.");
      }
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadBuildingMessages = async () => {
    setLoadingMessages(true);
    setMessageError("");

    try {
      const res = await api.get("/api/messages/building");
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setMessageError("פג תוקף ההתחברות. יש להתחבר מחדש.");
      } else if (status === 403) {
        setMessageError("אין לך הרשאה לצפות בצ'אט הדיירים.");
      } else {
        setMessageError("לא הצלחנו לטעון את הודעות הצ'אט.");
      }
    } finally {
      setLoadingMessages(false);
    }
  };

  const loadAnnouncements = async () => {
    setLoadingAnnouncements(true);
    setAnnouncementError("");

    try {
      const res = await api.get("/api/announcements/tenant");
      const rows = Array.isArray(res.data) ? res.data : [];
      setAnnouncements(rows);

      const readIds = getReadAnnouncementIds();
      const latestUnread = rows.find((item) => !readIds.includes(item._id));
      setAnnouncementPopup(latestUnread || null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        setAnnouncementError("פג תוקף ההתחברות. יש להתחבר מחדש.");
      } else if (status === 403) {
        setAnnouncementError("אין לך הרשאה לצפות בהודעות הוועד.");
      } else {
        setAnnouncementError("לא הצלחנו לטעון את הודעות הוועד.");
      }

      setAnnouncements([]);
      setAnnouncementPopup(null);
    } finally {
      setLoadingAnnouncements(false);
    }
  };

  const closeAnnouncementPopup = () => {
    if (announcementPopup?._id) {
      markAnnouncementAsRead(announcementPopup._id);
      return;
    }

    setAnnouncementPopup(null);
  };

  const showAnnouncementAgain = (announcement) => {
    setAnnouncementPopup(announcement);
  };


  const handlePayPalReturn = async () => {
    if (handledPayPalRef.current) return;

    const params = new URLSearchParams(window.location.search);
    const paypalState = params.get("paypal");
    const orderId = params.get("token");

    if (paypalState === "cancel") {
      handledPayPalRef.current = true;
      setPaymentError("תשלום PayPal בוטל על ידי המשתמש.");
      navigate("/tenant", { replace: true });
      return;
    }

    if (!orderId) return;

    handledPayPalRef.current = true;
    setSubmittingPayment(true);
    setPaymentError("");
    setPaymentSuccess("");

    try {
      await api.get(`/api/payments/paypal/capture?orderId=${orderId}`);
      setPaymentAmount("");
      setPaymentCity("");
      setPaymentMethod("credit");
      setPaymentSuccess("תשלום PayPal הושלם בהצלחה.");
      navigate("/tenant", { replace: true });
      await loadMyPayments();
    } catch (err) {
      setPaymentError(
        err?.response?.data?.message || "אישור תשלום PayPal נכשל.",
      );
      navigate("/tenant", { replace: true });
    } finally {
      setSubmittingPayment(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/");
      return;
    }

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role === "admin") {
      navigate("/admin");
      return;
    }
    if (parsedUser.role === "company") {
      navigate("/company");
      return;
    }
    if (parsedUser.role === "committee") {
      navigate("/committee");
      return;
    }

    setUser(parsedUser);
    loadMyFaults();
    loadMyPayments();
    loadBuildingMessages();
    loadAnnouncements();
    handlePayPalReturn();
  }, [navigate]);

  const createFault = async (e) => {
    e.preventDefault();
    setSubmittingFault(true);
    setFaultError("");
    setFaultSuccess("");

    try {
      await api.post("/api/faults", { title, description });
      setTitle("");
      setDescription("");
      setFaultSuccess("התקלה נפתחה בהצלחה.");
      await loadMyFaults();
    } catch (err) {
      setFaultError("פתיחת תקלה נכשלה. בדוק שהכותרת והתיאור מלאים.");
    } finally {
      setSubmittingFault(false);
    }
  };

  const createPayment = async (e) => {
    e.preventDefault();
    setSubmittingPayment(true);
    setPaymentError("");
    setPaymentSuccess("");

    try {
      const res = await api.post("/api/payments", {
        amount: Number(paymentAmount),
        city: paymentCity || "לא ידוע",
        monthKey: getCurrentMonthKey(),
        paymentMethod,
      });

      if (paymentMethod === "paypal" && res?.data?.approvalUrl) {
        window.location.href = res.data.approvalUrl;
        return;
      }

      setPaymentAmount("");
      setPaymentCity("");
      setPaymentMethod("credit");
      setPaymentSuccess(
        paymentMethod === "bit"
          ? "תשלום Bit נרשם בהצלחה."
          : "התשלום נרשם בהצלחה.",
      );
      await loadMyPayments();
    } catch (err) {
      setPaymentError(
        err?.response?.data?.message || "ביצוע התשלום נכשל. בדוק שהסכום תקין.",
      );
    } finally {
      setSubmittingPayment(false);
    }
  };

  const createMessage = async (e) => {
    e.preventDefault();
    setSubmittingMessage(true);
    setMessageError("");
    setMessageSuccess("");

    try {
      await api.post("/api/messages", { text: messageText });
      setMessageText("");
      setMessageSuccess("ההודעה נשלחה.");
      await loadBuildingMessages();
    } catch (err) {
      setMessageError("שליחת ההודעה נכשלה.");
    } finally {
      setSubmittingMessage(false);
    }
  };

  const openFaultsCount = useMemo(
    () => faults.filter((fault) => fault.status === "open").length,
    [faults],
  );

  const inProgressFaultsCount = useMemo(
    () => faults.filter((fault) => fault.status === "in_progress").length,
    [faults],
  );

  const totalPaid = useMemo(
    () =>
      payments
        .filter((payment) => payment.status === "paid")
        .reduce((sum, payment) => sum + Number(payment.amount || 0), 0),
    [payments],
  );

  const unreadAnnouncementsCount = useMemo(
    () => announcements.filter((item) => !isAnnouncementRead(item._id)).length,
    [announcements],
  );

  const latestPayment = payments.length > 0 ? payments[0] : null;

  if (!user) return null;

  return (
    <div
      className="min-h-screen bg-slate-100 text-slate-800 relative"
      dir="rtl"
    >
      {announcementPopup && (
        <div className="fixed top-5 left-5 z-50 w-[360px] max-w-[92vw]">
          <div className="rounded-2xl border border-emerald-200 bg-white shadow-2xl overflow-hidden">
            <div className="bg-emerald-600 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">הודעת ועד חדשה</p>
                <p className="text-xs text-emerald-50">
                  {announcementPopup.createdByName || "ועד הבית"}
                </p>
              </div>

              <button
                onClick={closeAnnouncementPopup}
                className="text-white/90 hover:text-white text-lg leading-none"
                aria-label="סגור הודעה"
                type="button"
              >
                ✕
              </button>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h3 className="text-base font-bold text-slate-900">
                  {announcementPopup.title}
                </h3>

                {!isAnnouncementRead(announcementPopup._id) && (
                  <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 text-xs font-semibold">
                    חדש
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-700 whitespace-pre-line leading-6">
                {announcementPopup.body}
              </p>

              <div className="mt-4 text-xs text-slate-500">
                {formatDate(announcementPopup.createdAt)}
              </div>

              <div className="mt-4 flex justify-end gap-2">
                {!isAnnouncementRead(announcementPopup._id) && (
                  <button
                    onClick={() =>
                      markAnnouncementAsRead(announcementPopup._id)
                    }
                    type="button"
                    className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-2 text-sm font-medium hover:bg-emerald-100 transition"
                  >
                    סמן כנקרא
                  </button>
                )}

                <button
                  onClick={closeAnnouncementPopup}
                  type="button"
                  className="rounded-xl bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800 transition"
                >
                  סגור
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6 md:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            דייר – אזור אישי
          </h1>
          <p className="text-slate-600">
            שלום, {user.fullName || user.email} 👋 ברוך הבא לאזור האישי שלך.
          </p>

          {announcementError && (
            <div className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              {announcementError}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-2">תקלות פתוחות</p>
            <p className="text-3xl font-bold text-slate-900">
              {openFaultsCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-2">תקלות בטיפול</p>
            <p className="text-3xl font-bold text-slate-900">
              {inProgressFaultsCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-2">סה״כ תשלומים ששולמו</p>
            <p className="text-3xl font-bold text-slate-900">
              ₪{totalPaid.toLocaleString("he-IL")}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <p className="text-sm text-slate-500 mb-2">הודעות ועד שלא נקראו</p>
            <p className="text-3xl font-bold text-slate-900">
              {unreadAnnouncementsCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  פתיחת תקלה חדשה
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  פתח קריאת שירות חדשה בצורה מסודרת ומהירה.
                </p>
              </div>

              <form onSubmit={createFault} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    כותרת
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="לדוגמה: נזילה בכיור"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    תיאור
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={5}
                    placeholder="תאר בקצרה מה הבעיה ומתי התחילה..."
                    required
                  />
                </div>

                {faultError && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {faultError}
                  </div>
                )}

                {faultSuccess && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    {faultSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingFault}
                  className="w-full rounded-xl bg-emerald-600 text-white py-3 font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {submittingFault ? "שולח..." : "פתח תקלה"}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-900">
                  תשלום ועד
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  ניתן להזין תשלום ולבחור אמצעי תשלום מועדף.
                </p>
              </div>

              <form onSubmit={createPayment} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    סכום לתשלום
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="לדוגמה: 250"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-700">
                    עיר
                  </label>
                  <input
                    value={paymentCity}
                    onChange={(e) => setPaymentCity(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="לדוגמה: תל אביב"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-slate-700">
                    אמצעי תשלום
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: "bit", label: "Bit" },
                      { value: "paypal", label: "PayPal" },
                      { value: "applepay", label: "Apple Pay" },
                      { value: "googlepay", label: "Google Pay" },
                      { value: "credit", label: "אשראי" },
                    ].map((method) => (
                      <button
                        key={method.value}
                        type="button"
                        onClick={() => setPaymentMethod(method.value)}
                        className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                          paymentMethod === method.value
                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                            : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {method.label}
                      </button>
                    ))}
                  </div>
                </div>

                {paymentError && (
                  <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                    {paymentError}
                  </div>
                )}

                {paymentSuccess && (
                  <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    {paymentSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="w-full rounded-xl bg-slate-900 text-white py-3 font-medium hover:bg-slate-800 transition disabled:opacity-60"
                >
                  {submittingPayment ? "מעבד תשלום..." : "שלם ועד"}
                </button>
              </form>
            </div>
          </div>

          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    הודעות ועד
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    היסטוריית הודעות רשמיות שנשלחו על ידי ועד הבית.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={loadAnnouncements}
                    className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium"
                  >
                    רענון
                  </button>

                  {announcements.length > 0 && unreadAnnouncementsCount > 0 && (
                    <button
                      onClick={markAllAnnouncementsAsRead}
                      className="rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-4 py-2 text-sm font-medium"
                    >
                      סמן הכל כנקרא
                    </button>
                  )}
                </div>
              </div>

              {loadingAnnouncements ? (
                <div className="text-slate-500">טוען הודעות ועד...</div>
              ) : announcements.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-500">
                  עדיין אין הודעות ועד להצגה.
                </div>
              ) : (
                <div className="space-y-4">
                  {announcements.map((announcement) => {
                    const isRead = isAnnouncementRead(announcement._id);
                    const isNew = !isRead;

                    return (
                      <div
                        key={announcement._id}
                        className={`rounded-2xl border p-4 transition ${
                          isNew
                            ? "border-emerald-300 bg-emerald-50 shadow-sm"
                            : "border-slate-200 bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-lg font-semibold text-slate-900">
                                {announcement.title}
                              </h3>

                              {isNew && (
                                <span className="inline-flex items-center rounded-full bg-red-50 text-red-700 border border-red-200 px-2.5 py-1 text-xs font-semibold">
                                  חדש
                                </span>
                              )}

                              {!isRead && (
                                <span className="inline-flex items-center rounded-full bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 text-xs font-semibold">
                                  לא נקראה
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-slate-500 mt-1">
                              {announcement.createdByName || "ועד הבית"} |{" "}
                              {formatDate(announcement.createdAt)}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                showAnnouncementAgain(announcement)
                              }
                              className="rounded-xl bg-white text-slate-700 border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-100 transition"
                            >
                              פתח כהודעה
                            </button>

                            {!isRead && (
                              <button
                                type="button"
                                onClick={() =>
                                  markAnnouncementAsRead(announcement._id)
                                }
                                className="rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-2 text-sm font-medium hover:bg-emerald-100 transition"
                              >
                                סמן כנקרא
                              </button>
                            )}
                          </div>
                        </div>

                        <p className="text-sm text-slate-700 whitespace-pre-line leading-6 mt-3">
                          {announcement.body}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    צ'אט דיירים
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    צ'אט פנימי בין דיירי אותו בניין.
                  </p>
                </div>

                <button
                  onClick={loadBuildingMessages}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium"
                >
                  רענון
                </button>
              </div>

              <form onSubmit={createMessage} className="mb-4 flex gap-2">
                <input
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="כתוב הודעה לדיירי הבניין..."
                  required
                />
                <button
                  type="submit"
                  disabled={submittingMessage}
                  className="rounded-xl bg-emerald-600 text-white px-5 py-2.5 font-medium hover:bg-emerald-700 transition disabled:opacity-60"
                >
                  {submittingMessage ? "שולח..." : "שלח"}
                </button>
              </form>

              {messageError && (
                <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                  {messageError}
                </div>
              )}

              {messageSuccess && (
                <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                  {messageSuccess}
                </div>
              )}

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 max-h-[380px] overflow-y-auto space-y-3">
                {loadingMessages ? (
                  <div className="text-slate-500">טוען הודעות...</div>
                ) : messages.length === 0 ? (
                  <div className="text-slate-500">
                    אין הודעות עדיין בצ'אט הבניין.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = String(msg.senderId) === String(user._id);

                    return (
                      <div
                        key={msg._id}
                        className={`flex ${isMine ? "justify-start" : "justify-end"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                            isMine
                              ? "bg-emerald-50 border border-emerald-200"
                              : "bg-white border border-slate-200"
                          }`}
                        >
                          <p className="text-xs text-slate-500 mb-1">
                            {msg.senderName} • {formatDate(msg.createdAt)}
                          </p>
                          <p className="text-sm text-slate-800 whitespace-pre-line">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    התקלות שלי
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    כאן תוכל לצפות בכל הקריאות שפתחת.
                  </p>
                </div>

                <button
                  onClick={loadMyFaults}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium"
                >
                  רענון
                </button>
              </div>

              {loadingFaults ? (
                <div className="text-slate-500">טוען תקלות...</div>
              ) : faults.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-500">
                  אין לך תקלות פתוחות או קודמות כרגע.
                </div>
              ) : (
                <div className="space-y-4">
                  {faults.map((fault) => (
                    <div
                      key={fault._id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900">
                            {fault.title}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1 whitespace-pre-line">
                            {fault.description}
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusBadgeClass(
                            fault.status,
                          )}`}
                        >
                          {statusLabel(fault.status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm">
                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-slate-500 mb-1">עדכון מהוועד</p>
                          <p className="text-slate-800">
                            {fault.adminNote ? (
                              fault.adminNote
                            ) : (
                              <span className="text-slate-400">
                                אין עדכון כרגע
                              </span>
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl bg-white border border-slate-200 p-3">
                          <p className="text-slate-500 mb-1">נוצר בתאריך</p>
                          <p className="text-slate-800">
                            {formatDate(fault.createdAt)}
                          </p>
                        </div>
                      </div>

                      {Array.isArray(fault.history) &&
                        fault.history.length > 0 && (
                          <div className="mt-4 rounded-xl bg-white border border-slate-200 p-3">
                            <p className="text-sm font-semibold text-slate-800 mb-3">
                              היסטוריית טיפול
                            </p>

                            <div className="space-y-2">
                              {fault.history.map((item) => (
                                <div
                                  key={item._id}
                                  className="border-r-2 border-emerald-500 pr-3"
                                >
                                  <p className="text-sm text-slate-800">
                                    {item.text}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {item.byName || "מערכת"} |{" "}
                                    {formatDate(item.createdAt)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    התשלומים שלי
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    היסטוריית תשלומים שבוצעו במערכת.
                  </p>
                </div>

                <button
                  onClick={loadMyPayments}
                  className="rounded-xl bg-slate-100 hover:bg-slate-200 px-4 py-2 text-sm font-medium"
                >
                  רענון
                </button>
              </div>

              {loadingPayments ? (
                <div className="text-slate-500">טוען תשלומים...</div>
              ) : payments.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-slate-500">
                  עדיין אין תשלומים להצגה.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right min-w-[700px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-sm">
                        <th className="py-3 px-2 font-medium">חודש</th>
                        <th className="py-3 px-2 font-medium">סכום</th>
                        <th className="py-3 px-2 font-medium">עיר</th>
                        <th className="py-3 px-2 font-medium">סטטוס</th>
                        <th className="py-3 px-2 font-medium">תאריך תשלום</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr
                          key={payment._id}
                          className="border-b border-slate-100"
                        >
                          <td className="py-3 px-2">
                            {payment.monthKey || "-"}
                          </td>
                          <td className="py-3 px-2 font-medium">
                            ₪
                            {Number(payment.amount || 0).toLocaleString(
                              "he-IL",
                            )}
                          </td>
                          <td className="py-3 px-2">{payment.city || "-"}</td>
                          <td className="py-3 px-2">
                            <span className="inline-flex rounded-full border border-green-200 bg-green-50 text-green-700 px-3 py-1 text-sm">
                              {paymentStatusLabel(payment.status)}
                            </span>
                          </td>
                          <td className="py-3 px-2">
                            {formatDate(payment.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {latestPayment && (
                <div className="mt-4 rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <p className="text-sm text-slate-500 mb-1">תשלום אחרון</p>
                  <p className="text-slate-900 font-medium">
                    ₪{Number(latestPayment.amount || 0).toLocaleString("he-IL")}{" "}
                    | {latestPayment.monthKey} |{" "}
                    {formatDate(latestPayment.createdAt)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
