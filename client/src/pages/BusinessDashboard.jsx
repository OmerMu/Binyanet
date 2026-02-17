import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function BusinessDashboard() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const statusMap = useMemo(() => {
    const m = {};
    (data?.byStatus || []).forEach((x) => (m[x.key] = x.count));
    return m;
  }, [data]);

  const pieData = useMemo(() => {
    return (data?.byStatus || []).map((x) => ({ name: x.key, value: x.count }));
  }, [data]);

  const load = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await api.get("/api/analytics/summary");
      setData(res.data);
    } catch {
      setErr("שגיאה בטעינת נתונים (ודא שיש הרשאה: business/super_admin)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const labelStatus = (s) => {
    if (s === "open") return "פתוחות";
    if (s === "in_progress") return "בטיפול";
    if (s === "closed") return "סגורות";
    return s;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-100 text-gray-800">טוען...</div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-800">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-3xl font-bold">דשבורד עסקי (BI)</h1>
        <button
          onClick={load}
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
        >
          רענון
        </button>
      </div>

      {err && (
        <div className="mb-4 text-red-600 text-sm border border-red-200 bg-red-50 p-2 rounded">
          {err}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <Kpi title='סה"כ תקלות' value={data?.total ?? 0} />
        <Kpi title="פתוחות" value={statusMap.open ?? 0} />
        <Kpi title="בטיפול" value={statusMap.in_progress ?? 0} />
        <Kpi title="סגורות" value={statusMap.closed ?? 0} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-3">תקלות לאורך זמן</h2>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={data?.byMonth || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <h2 className="text-lg font-semibold mb-3">פילוח לפי קטגוריה</h2>
          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <BarChart data={data?.byCategory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="key" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 lg:col-span-2">
          <h2 className="text-lg font-semibold mb-3">סטטוס תקלות</h2>
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Tooltip formatter={(v, n) => [v, labelStatus(n)]} />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                >
                  {(pieData || []).map((_, idx) => (
                    <Cell key={idx} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function Kpi({ title, value }) {
  return (
    <div className="bg-white rounded shadow p-4">
      <div className="text-sm text-gray-600">{title}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
