const Fault = require("../models/Fault");
const Payment = require("../models/Payment");
const User = require("../models/User");

function monthKeyFromDate(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

exports.getSummary = async (req, res) => {
  try {
    const [byStatus, byCategory, byMonth] = await Promise.all([
      Fault.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, key: "$_id", count: 1 } },
      ]),
      Fault.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { _id: 0, key: "$_id", count: 1 } },
      ]),
      Fault.aggregate([
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m", date: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: "$_id", count: 1 } },
      ]),
    ]);

    const total = await Fault.countDocuments();

    return res.json({
      total,
      byStatus,
      byCategory,
      byMonth,
    });
  } catch (err) {
    console.error("ANALYTICS ERROR:", err);
    return res.status(500).json({ message: "שגיאה בטעינת אנליטיקה" });
  }
};

// ✅ חדש: דשבורד company עם תקלות + תשלומים + KPI
exports.getCompanyDashboard = async (req, res) => {
  try {
    const currentMonth = monthKeyFromDate(new Date());

    const [
      faultsTotal,
      faultsByStatus,
      faultsByCategory,
      faultsByMonth,

      totalRevenueAgg,
      monthRevenueAgg,
      revenueByMonthAgg,
      revenueByCityAgg,

      tenantsCount,
      pendingApprovalsCount,

      slaAgg,
    ] = await Promise.all([
      Fault.countDocuments(),
      Fault.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, key: "$_id", count: 1 } },
      ]),
      Fault.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $project: { _id: 0, key: "$_id", count: 1 } },
      ]),
      Fault.aggregate([
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: "$_id", count: 1 } },
      ]),

      // --- Payments: total revenue (paid)
      Payment.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$amount" },
            totalPayments: { $sum: 1 },
          },
        },
        { $project: { _id: 0, totalRevenue: 1, totalPayments: 1 } },
      ]),

      // --- Payments: this month revenue
      Payment.aggregate([
        { $match: { status: "paid", monthKey: currentMonth } },
        {
          $group: {
            _id: null,
            monthRevenue: { $sum: "$amount" },
            monthPayments: { $sum: 1 },
          },
        },
        { $project: { _id: 0, monthRevenue: 1, monthPayments: 1 } },
      ]),

      // --- Payments: revenue by month
      Payment.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: "$monthKey",
            revenue: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, month: "$_id", revenue: 1, count: 1 } },
      ]),

      // --- Payments: revenue by city
      Payment.aggregate([
        { $match: { status: "paid" } },
        {
          $group: {
            _id: "$city",
            revenue: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        { $project: { _id: 0, city: "$_id", revenue: 1, count: 1 } },
      ]),

      // tenants count (role tenant)
      User.countDocuments({ role: "tenant" }),

      // pending approvals (אם יש לך isApproved / pending) — אם אין, יצא 0 וזה בסדר
      User.countDocuments({ isApproved: false }),

      // SLA avg hours to close
      Fault.aggregate([
        { $match: { status: "closed" } },
        {
          $project: {
            diffHours: {
              $divide: [
                { $subtract: ["$updatedAt", "$createdAt"] },
                1000 * 60 * 60,
              ],
            },
          },
        },
        {
          $group: {
            _id: null,
            avgHours: { $avg: "$diffHours" },
            closedCount: { $sum: 1 },
          },
        },
        { $project: { _id: 0, avgHours: 1, closedCount: 1 } },
      ]),
    ]);

    const totalRevenue = totalRevenueAgg?.[0]?.totalRevenue || 0;
    const totalPayments = totalRevenueAgg?.[0]?.totalPayments || 0;

    const monthRevenue = monthRevenueAgg?.[0]?.monthRevenue || 0;
    const monthPayments = monthRevenueAgg?.[0]?.monthPayments || 0;

    const avgCloseHours = slaAgg?.[0]?.avgHours || 0;
    const closedCount = slaAgg?.[0]?.closedCount || 0;

    return res.json({
      currentMonth,
      kpi: {
        totalRevenue,
        totalPayments,
        monthRevenue,
        monthPayments,
        tenantsCount: tenantsCount || 0,
        pendingApprovals: pendingApprovalsCount || 0,
        avgCloseHours,
        closedCount,
      },
      payments: {
        byMonth: revenueByMonthAgg || [],
        byCity: revenueByCityAgg || [],
      },
      faults: {
        total: faultsTotal || 0,
        byStatus: faultsByStatus || [],
        byCategory: faultsByCategory || [],
        byMonth: faultsByMonth || [],
      },
    });
  } catch (err) {
    console.error("COMPANY DASHBOARD ERROR:", err);
    return res.status(500).json({ message: "שגיאה בטעינת דשבורד חברה" });
  }
};
