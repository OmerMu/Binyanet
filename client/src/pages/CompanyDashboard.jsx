import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";

const STATUS_LABELS = {
  open: "פתוחות",
  in_progress: "בטיפול",
  closed: "סגורות",
};

const CATEGORY_LABELS = {
  general: "כללי",
  plumbing: "אינסטלציה",
  electric: "חשמל",
  cleaning: "ניקיון",
  other: "אחר",
};

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMonthHe(monthStr) {
  if (!monthStr || typeof monthStr !== "string") return "";
  const [y, m] = monthStr.split("-");
  if (!y || !m) return monthStr;
  return `${m}/${y}`;
}

function sumValues(arr) {
  return (Array.isArray(arr) ? arr : []).reduce(
    (s, x) => s + safeNum(x?.value),
    0,
  );
}

function TooltipBox({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = payload[0]?.payload || {};
  const name = p?.name || p?.city || label || "";
  const value = p?.value ?? p?.revenue ?? payload[0]?.value ?? 0;

  return (
    <div className="bg-white border border-gray-200 shadow-sm rounded-xl px-3 py-2 text-sm">
      <div className="font-semibold text-gray-900">{name}</div>
      <div className="text-gray-600">ערך: {value}</div>
    </div>
  );
}

function KpiCard({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-3xl font-extrabold mt-1 text-gray-900">{value}</div>
      {subtitle ? (
        <div className="text-xs text-gray-400 mt-1">{subtitle}</div>
      ) : null}
    </div>
  );
}

function SectionCard({ title, right, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="text-lg font-bold text-gray-900">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center text-gray-500">
      {text}
    </div>
  );
}

function MiniTable({ rows, emptyText, col1 = "שם", col2 = "כמות" }) {
  if (!rows || rows.length === 0)
    return <div className="text-gray-500">{emptyText}</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-right text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="p-2 font-semibold text-gray-700">{col1}</th>
            <th className="p-2 font-semibold text-gray-700">{col2}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-b last:border-b-0">
              <td className="p-2 text-gray-800">{r.name}</td>
              <td className="p-2 font-semibold text-gray-900">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompanyDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState("all"); // all / last6 / last12
  const [showZeroes, setShowZeroes] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/api/analytics/company");
      console.log("company analytics:", res.status, res.data); // נשאיר לך לבדיקות
      setData(res.data);
    } catch (err) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message;
      setError(
        `לא הצלחנו לטעון נתונים (${status || "?"}). ${msg || "ודא שיש הרשאת company ושהשרת רץ."}`,
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const faultsData = data?.faults || null;

  const faultsKpi = useMemo(() => {
    const total = safeNum(faultsData?.total);
    const byStatus = Array.isArray(faultsData?.byStatus)
      ? faultsData.byStatus
      : [];
    const getStatus = (k) => safeNum(byStatus.find((x) => x?.key === k)?.count);

    return {
      total,
      open: getStatus("open"),
      inProgress: getStatus("in_progress"),
      closed: getStatus("closed"),
    };
  }, [faultsData]);

  const statusDataRaw = useMemo(() => {
    const byStatus = Array.isArray(faultsData?.byStatus)
      ? faultsData.byStatus
      : [];
    const base = ["open", "in_progress", "closed"].map((k) => ({
      key: k,
      name: STATUS_LABELS[k] || k,
      value: safeNum(byStatus.find((x) => x?.key === k)?.count),
    }));
    return base.filter((x) => x.value > 0);
  }, [faultsData]);

  const categoryDataRaw = useMemo(() => {
    const byCategory = Array.isArray(faultsData?.byCategory)
      ? faultsData.byCategory
      : [];
    return byCategory
      .map((x) => ({
        key: x?.key ?? "other",
        name: CATEGORY_LABELS[x?.key] || x?.key || "אחר",
        value: safeNum(x?.count),
      }))
      .filter((x) => x.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [faultsData]);

  const monthDataRaw = useMemo(() => {
    const byMonth = Array.isArray(faultsData?.byMonth)
      ? faultsData.byMonth
      : [];
    const sorted = [...byMonth].sort((a, b) =>
      String(a?.month || "").localeCompare(String(b?.month || "")),
    );
    return sorted.map((x) => ({
      month: x?.month || "",
      label: formatMonthHe(x?.month),
      value: safeNum(x?.count),
    }));
  }, [faultsData]);

  const monthData = useMemo(() => {
    let arr = monthDataRaw;
    if (viewMode === "last6") arr = arr.slice(-6);
    if (viewMode === "last12") arr = arr.slice(-12);
    if (!showZeroes) arr = arr.filter((x) => x.value > 0);
    return arr;
  }, [monthDataRaw, viewMode, showZeroes]);

  const statusTotal = useMemo(() => sumValues(statusDataRaw), [statusDataRaw]);
  const categoryTotal = useMemo(
    () => sumValues(categoryDataRaw),
    [categoryDataRaw],
  );

  // ✅ Payments charts data
  const paymentsByMonth = useMemo(() => {
    const arr = Array.isArray(data?.payments?.byMonth)
      ? data.payments.byMonth
      : [];
    const sorted = [...arr].sort((a, b) =>
      String(a?.month || "").localeCompare(String(b?.month || "")),
    );
    const mapped = sorted.map((x) => ({
      month: x.month,
      label: formatMonthHe(x.month),
      revenue: safeNum(x.revenue),
      count: safeNum(x.count),
    }));
    if (viewMode === "last6") return mapped.slice(-6);
    if (viewMode === "last12") return mapped.slice(-12);
    return mapped;
  }, [data, viewMode]);

  const paymentsByCity = useMemo(() => {
    const arr = Array.isArray(data?.payments?.byCity)
      ? data.payments.byCity
      : [];
    return arr
      .map((x) => ({
        city: x.city || "לא ידוע",
        revenue: safeNum(x.revenue),
        count: safeNum(x.count),
      }))
      .filter((x) => x.revenue > 0);
  }, [data]);

  const kpi = data?.kpi || {};

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50 text-gray-800" dir="rtl">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-56 bg-gray-200 rounded" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="h-28 bg-gray-200 rounded-2xl" />
              <div className="h-28 bg-gray-200 rounded-2xl" />
              <div className="h-28 bg-gray-200 rounded-2xl" />
              <div className="h-28 bg-gray-200 rounded-2xl" />
            </div>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="h-80 bg-gray-200 rounded-2xl" />
              <div className="h-80 bg-gray-200 rounded-2xl" />
            </div>
            <div className="h-80 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-800" dir="rtl">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              דשבורד חברה
            </h1>
            <div className="text-sm text-gray-500 mt-1">
              תקלות + הכנסות + KPI
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="border border-gray-200 bg-white rounded-xl px-3 py-2 text-sm shadow-sm"
              title="טווח חודשים"
            >
              <option value="all">כל התקופה</option>
              <option value="last6">6 חודשים אחרונים</option>
              <option value="last12">12 חודשים אחרונים</option>
            </select>

            <button
              onClick={load}
              className="px-4 py-2 rounded-xl bg-gray-900 text-white hover:bg-black transition shadow-sm"
            >
              רענון נתונים
            </button>
          </div>
        </div>

        {error ? (
          <div className="bg-white border border-red-200 text-red-700 p-4 rounded-2xl mb-6">
            {error}
          </div>
        ) : null}

        {!data ? (
          <EmptyState text="אין נתונים להצגה כרגע." />
        ) : (
          <>
            {/* KPI - Payments */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <KpiCard
                title="סה״כ הכנסות"
                value={`${safeNum(kpi.totalRevenue)} ₪`}
                subtitle="כל התקופה"
              />
              <KpiCard
                title="הכנסות החודש"
                value={`${safeNum(kpi.monthRevenue)} ₪`}
                subtitle={data.currentMonth || ""}
              />
              <KpiCard
                title="מס׳ תשלומים החודש"
                value={safeNum(kpi.monthPayments)}
                subtitle="תשלומים"
              />
              <KpiCard
                title="דיירים"
                value={safeNum(kpi.tenantsCount)}
                subtitle="Tenant במערכת"
              />
              <KpiCard
                title="ממתינים לאישור"
                value={safeNum(kpi.pendingApprovals)}
                subtitle="בקשות הרשמה"
              />
              <KpiCard
                title="זמן טיפול ממוצע"
                value={`${Math.round(safeNum(kpi.avgCloseHours))} שעות`}
                subtitle="SLA"
              />
            </div>

            {/* ✅ Payments Charts */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <SectionCard title="הכנסות לפי חודש">
                {paymentsByMonth.length === 0 ? (
                  <div className="text-gray-500">אין תשלומים להצגה עדיין.</div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={paymentsByMonth}
                        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip content={<TooltipBox />} />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          strokeWidth={2}
                          dot
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="הכנסות לפי עיר">
                {paymentsByCity.length === 0 ? (
                  <div className="text-gray-500">
                    אין תשלומים לפי עיר להצגה עדיין.
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentsByCity}
                          dataKey="revenue"
                          nameKey="city"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={2}
                        >
                          {paymentsByCity.map((_, idx) => (
                            <Cell key={idx} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<TooltipBox />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </SectionCard>
            </div>

            {/* KPI - Faults */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <KpiCard
                title="סה״כ תקלות"
                value={faultsKpi.total}
                subtitle="כל התקופה"
              />
              <KpiCard
                title="פתוחות"
                value={faultsKpi.open}
                subtitle="דורש טיפול"
              />
              <KpiCard
                title="בטיפול"
                value={faultsKpi.inProgress}
                subtitle="בתהליך"
              />
              <KpiCard
                title="סגורות"
                value={faultsKpi.closed}
                subtitle="טופלו"
              />
            </div>

            {/* Faults charts */}
            <div className="grid lg:grid-cols-2 gap-4 mb-4">
              <SectionCard title="התפלגות לפי סטטוס">
                {statusDataRaw.length === 0 ? (
                  <div className="text-gray-500">אין נתונים לסטטוסים.</div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusDataRaw}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={55}
                          outerRadius={95}
                          paddingAngle={2}
                        >
                          {statusDataRaw.map((_, idx) => (
                            <Cell key={idx} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<TooltipBox />} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="text-xs text-gray-400 mt-2">
                      סה״כ לסטטוסים: {statusTotal}
                    </div>
                  </div>
                )}
              </SectionCard>

              <SectionCard title="תקלות לפי קטגוריה">
                {categoryDataRaw.length === 0 ? (
                  <div className="text-gray-500">אין נתונים לקטגוריות.</div>
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={categoryDataRaw}
                        margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <RechartsTooltip content={<TooltipBox />} />
                        <Bar dataKey="value" />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="text-xs text-gray-400 mt-2">
                      סה״כ לקטגוריות: {categoryTotal}
                    </div>
                  </div>
                )}
              </SectionCard>
            </div>

            <SectionCard
              title="מגמה חודשית (תקלות)"
              right={
                <label className="flex items-center gap-2 text-sm text-gray-600 select-none">
                  <input
                    type="checkbox"
                    checked={showZeroes}
                    onChange={(e) => setShowZeroes(e.target.checked)}
                  />
                  להציג חודשים עם 0
                </label>
              }
            >
              {monthData.length === 0 ? (
                <div className="text-gray-500">
                  אין נתונים חודשים להצגה בטווח שנבחר.
                </div>
              ) : (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={monthData}
                      margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                      <YAxis allowDecimals={false} />
                      <RechartsTooltip content={<TooltipBox />} />
                      <Line
                        type="monotone"
                        dataKey="value"
                        strokeWidth={2}
                        dot
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </SectionCard>

            {/* Tables */}
            <div className="mt-4 grid lg:grid-cols-3 gap-4">
              <SectionCard title="טבלה לפי סטטוס">
                <MiniTable
                  rows={statusDataRaw.map((x) => ({
                    name: x.name,
                    value: x.value,
                  }))}
                  emptyText="אין נתונים"
                />
              </SectionCard>

              <SectionCard title="טבלה לפי קטגוריה">
                <MiniTable
                  rows={categoryDataRaw.map((x) => ({
                    name: x.name,
                    value: x.value,
                  }))}
                  emptyText="אין נתונים"
                />
              </SectionCard>

              <SectionCard title="טבלה לפי חודש">
                <MiniTable
                  rows={monthData.map((x) => ({
                    name: x.label,
                    value: x.value,
                  }))}
                  emptyText="אין נתונים"
                />
              </SectionCard>
            </div>

            {/* Payments tables (בונוס) */}
            <div className="mt-4 grid lg:grid-cols-2 gap-4">
              <SectionCard title="טבלת הכנסות לפי חודש">
                <MiniTable
                  rows={paymentsByMonth.map((x) => ({
                    name: x.label,
                    value: `${x.revenue} ₪`,
                  }))}
                  emptyText="אין נתונים"
                  col1="חודש"
                  col2="הכנסות"
                />
              </SectionCard>

              <SectionCard title="טבלת הכנסות לפי עיר">
                <MiniTable
                  rows={paymentsByCity.map((x) => ({
                    name: x.city,
                    value: `${x.revenue} ₪`,
                  }))}
                  emptyText="אין נתונים"
                  col1="עיר"
                  col2="הכנסות"
                />
              </SectionCard>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
