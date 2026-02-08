import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/");

    const parsedUser = JSON.parse(storedUser);

    if (parsedUser.role !== "admin") {
      return navigate("/dashboard");
    }

    setUser(parsedUser);
  }, [navigate]);

  if (!user) return null;

  const Card = ({ title, desc, to }) => (
    <button
      onClick={() => navigate(to)}
      className="text-right bg-white p-4 rounded-lg shadow hover:shadow-md transition border border-transparent hover:border-blue-200"
    >
      <h2 className="font-semibold mb-2 text-lg">{title}</h2>
      <p className="text-sm text-gray-600">{desc}</p>
    </button>
  );

  return (
    <div className="min-h-screen p-6 bg-gray-100 text-gray-800">
      <h1 className="text-3xl font-bold mb-2">ממשק ועד (Admin)</h1>
      <p className="mb-6">שלום, {user.name || "חבר ועד"} 👋</p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          title="דיירים"
          desc="ניהול דיירים, הרשאות, פרטים."
          to="/admin/tenants"
        />
        <Card
          title="תקלות"
          desc="צפייה, שינוי סטטוס, טיפול."
          to="/admin/faults"
        />
        <Card
          title="הודעות"
          desc="שליחת הודעות לכל הדיירים."
          to="/admin/announcements"
        />
      </div>
    </div>
  );
}
