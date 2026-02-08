// client/src/components/HeroSection.jsx

export default function HeroSection({ onLoginClick }) {
  return (
    <section className="bg-gradient-to-r from-blue-100 to-white py-20 px-6 lg:px-24 text-center">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold text-blue-800 mb-6 leading-tight">
          ניהול הבניין שלך מתחיל כאן
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          מערכת חכמה לניהול תקלות, תשלומים, הודעות ותקשורת בין דיירים – במקום
          אחד, בצורה פשוטה ומתקדמת.
        </p>
        <button
          onClick={onLoginClick}
          className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition"
        >
          התחבר עכשיו
        </button>
      </div>
    </section>
  );
}
