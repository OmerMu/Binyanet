import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goAnchor = (id) => {
    setOpen(false);
    // אם לא בדף הבית, ננווט אליו ואז נגלול
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      // קצר כדי לתת ל-React להחליף עמוד
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 50);
      return;
    }
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setOpen(false);
    navigate("/");
  };

  const goArea = () => {
    setOpen(false);
    if (!user) return goAnchor("contact");
    if (user.role === "admin") return navigate("/admin");
    return navigate("/dashboard");
  };

  return (
    <header
      className={[
        "sticky top-0 z-50 transition",
        scrolled
          ? "backdrop-blur bg-white/80 border-b border-gray-100"
          : "bg-transparent",
      ].join(" ")}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-extrabold">
            B
          </div>
          <div className="leading-tight">
            <div className="font-extrabold">Binyanet</div>
            <div className="text-xs text-gray-500 -mt-0.5">ניהול ועד בית</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-2">
          <button onClick={() => goAnchor("home")} className={navBtnClass}>
            בית
          </button>
          <button onClick={() => goAnchor("about")} className={navBtnClass}>
            אודות
          </button>
          <button onClick={() => goAnchor("services")} className={navBtnClass}>
            שירותים
          </button>
          <button onClick={() => goAnchor("contact")} className={navBtnClass}>
            יצירת קשר
          </button>

          <div className="w-px h-6 bg-gray-200 mx-2" />

          <button
            onClick={goArea}
            className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition"
          >
            {user ? "האזור האישי" : "השארת פרטים"}
          </button>

          {user && (
            <button
              onClick={logout}
              className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
            >
              התנתקות
            </button>
          )}
        </nav>

        {/* Mobile */}
        <button
          className="md:hidden w-10 h-10 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition flex items-center justify-center"
          onClick={() => setOpen((v) => !v)}
          aria-label="תפריט"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-2 text-right">
            <button onClick={() => goAnchor("home")} className={mobileBtnClass}>
              בית
            </button>
            <button
              onClick={() => goAnchor("about")}
              className={mobileBtnClass}
            >
              אודות
            </button>
            <button
              onClick={() => goAnchor("services")}
              className={mobileBtnClass}
            >
              שירותים
            </button>
            <button
              onClick={() => goAnchor("contact")}
              className={mobileBtnClass}
            >
              יצירת קשר
            </button>

            <div className="h-px bg-gray-100 my-2" />

            <button
              onClick={goArea}
              className="px-4 py-2 rounded-lg bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition"
            >
              {user ? "האזור האישי" : "השארת פרטים"}
            </button>

            {user && (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
              >
                התנתקות
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

const navBtnClass =
  "px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition font-medium";

const mobileBtnClass =
  "w-full px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-50 transition font-medium text-right";
