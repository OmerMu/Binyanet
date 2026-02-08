// client/src/components/Footer.jsx

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Binyanet. כל הזכויות שמורות.
        </p>

        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#home" className="text-sm hover:text-blue-400">
            בית
          </a>
          <a href="#about" className="text-sm hover:text-blue-400">
            אודות
          </a>
          <a href="#contact" className="text-sm hover:text-blue-400">
            צור קשר
          </a>
        </div>
      </div>
    </footer>
  );
}
