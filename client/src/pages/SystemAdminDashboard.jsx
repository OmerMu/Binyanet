import { useNavigate } from "react-router-dom";

export default function SystemAdminDashboard() {
  const navigate = useNavigate();

  const Card = ({ title, desc, to }) => (
    <button
      onClick={() => navigate(to)}
      className="text-right bg-white p-4 rounded-lg shadow hover:shadow-md transition border border-transparent hover:border-emerald-200"
    >
      <h2 className="font-semibold mb-2 text-lg">{title}</h2>
      <p className="text-sm text-gray-600">{desc}</p>
    </button>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">מנהל מערכת</h1>
      <p className="mb-6">ניהול משתמשים והרשאות מערכת.</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="משתמשים"
          desc="צפייה בכל המשתמשים, שינוי תפקידים, יצירת משתמשים."
          to="/system/users"
        />
        <Card
          title="דשבורד עסקי"
          desc="צפייה בנתונים וגרפים לקבלת החלטות."
          to="/business"
        />
      </div>
    </div>
  );
}
