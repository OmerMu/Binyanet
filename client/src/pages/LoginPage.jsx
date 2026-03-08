import { Link } from "react-router-dom";
import LoginForm from "../components/LoginForm";

export default function LoginPage() {
  return (
    <div
      className="min-h-screen bg-gray-100 flex items-center justify-center p-6"
      dir="rtl"
    >
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-6 border border-gray-100">
        <div className="text-right">
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border text-sm text-gray-700">
            כניסה למערכת Binyanet
          </p>

          <h1 className="text-2xl font-bold mt-4">כניסה לאזור האישי</h1>
          <p className="text-gray-600 mt-2 leading-7">
            התחברו כדי לצפות בתקלות, לעקוב אחר סטטוסים ולעבוד מול הנהלת הבניין
            בצורה מסודרת ושקופה.
          </p>
        </div>

        <div className="mt-6">
          <LoginForm />
        </div>

        <div className="mt-5 text-right text-sm text-gray-600">
          אין לך חשבון עדיין?{" "}
          <Link to="/register" className="text-black font-semibold underline">
            הרשמה
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
          <Link to="/" className="underline hover:text-gray-700">
            חזרה לדף הבית
          </Link>
          <span>התחברות מאובטחת והרשאות לפי תפקיד</span>
        </div>
      </div>
    </div>
  );
}
