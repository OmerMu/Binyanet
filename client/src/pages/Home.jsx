import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import LeadForm from "../components/LeadForm";
import LoginModal from "../components/LoginModal";

const BUILDINGS_BG =
  "https://images2.madlan.co.il/t:nonce:v=2/projects/%D7%A7%D7%A8%D7%9C_%D7%A4%D7%95%D7%A4%D7%A8_7_%D7%A0%D7%AA%D7%A0%D7%99%D7%94/VRayCam006Day-427224f7-3105-4ed9-8617-e858fe8b978a.png";

export default function Home() {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);

  // Scroll for dynamic background (zoom/parallax)
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const goToArea = () => {
    if (!user) return setLoginOpen(true);
    if (user.role === "admin") return navigate("/admin");
    return navigate("/dashboard");
  };

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  // ---- Dynamic background calculations ----
  const maxScroll = 1200;
  const t = Math.min(scrollY / maxScroll, 1);
  const scale = 1 + t * 0.16; // 1 -> 1.16
  const translateY = t * 50; // 0 -> 50px

  const bgStyle = {
    backgroundImage: `url(${BUILDINGS_BG})`,
    transform: `translateY(${translateY}px) scale(${scale})`,
  };

  return (
    <div className="relative text-[#1F1F1F]">
      {/* FULL PAGE BACKGROUND (fixed) */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div
          className="absolute inset-0 bg-center bg-cover will-change-transform transition-transform duration-200"
          style={bgStyle}
        />
        {/* very light overlay so text is readable everywhere (NOT white cover) */}
        <div className="absolute inset-0 bg-black/20" />
        {/* optional subtle vignette for depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/30" />
      </div>

      {/* HERO */}
      <section id="home" className="min-h-[80vh] flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28 w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-right">
              <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-white/40 text-sm text-[#1F1F1F] backdrop-blur">
                מערכת חכמה לניהול ועד בית
              </p>

              <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold leading-[1.15] text-white drop-shadow">
                Binyanet – ניהול ועד בית{" "}
                <span className="text-white/95">מסודר, נעים וברור</span>
              </h1>

              <p className="mt-5 text-lg leading-8 text-white/90 drop-shadow">
                פחות הודעות בוואטסאפ, פחות בלבול, יותר תהליך מסודר: דיירים
                פותחים תקלות, הוועד מעדכן סטטוס ומוסיף הערה – והכל נשמר.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3 sm:items-center">
                <button
                  onClick={() => scrollTo("contact")}
                  className="px-6 py-3 rounded-xl bg-white text-[#1F1F1F] font-semibold hover:bg-white/90 transition shadow"
                >
                  השארת פרטים להצטרפות
                </button>

                <button
                  onClick={goToArea}
                  className="px-6 py-3 rounded-xl bg-black/40 border border-white/40 text-white font-semibold hover:bg-black/50 transition backdrop-blur"
                >
                  התחברות ללקוחות קיימים
                </button>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-3 text-center">
                <Stat title="תקלות" value="ניהול מלא" />
                <Stat title="דיירים" value="שליטה והרשאות" />
                <Stat title="שקיפות" value="עדכונים בזמן אמת" />
              </div>
            </div>

            {/* Right card */}
            <div className="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-white/40 p-7 lg:p-9">
              <h3 className="text-2xl font-extrabold text-right text-[#1F1F1F]">
                מה מקבלים בפועל?
              </h3>

              <ul className="mt-5 space-y-3 text-right text-[#1F1F1F]">
                <li className="flex flex-row-reverse gap-3">
                  <Dot /> דייר פותח תקלה ומקבל סטטוס מסודר
                </li>
                <li className="flex flex-row-reverse gap-3">
                  <Dot /> ועד מעדכן סטטוס + הערת ועד לדייר
                </li>
                <li className="flex flex-row-reverse gap-3">
                  <Dot /> אזור אדמין ייעודי לחברי ועד בלבד
                </li>
                <li className="flex flex-row-reverse gap-3">
                  <Dot /> בסיס להרחבות: תשלומים, ספקים, מסמכים ועוד
                </li>
              </ul>

              <div className="mt-7 p-5 rounded-2xl bg-white/70 border border-white/40 text-right">
                <p className="font-semibold text-[#1F1F1F]">
                  רוצה שנראה לך דמו?
                </p>
                <p className="text-[#1F1F1F]/70 text-sm mt-1 leading-6">
                  השאר פרטים ונחזור אליך עם הצגת מערכת קצרה + התאמה לבניין.
                </p>
                <button
                  onClick={() => scrollTo("contact")}
                  className="mt-4 w-full px-4 py-2.5 rounded-xl bg-[#1F1F1F] text-white hover:bg-black transition font-semibold"
                >
                  כן, דברו איתי
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-right">
            <h2 className="text-3xl font-extrabold text-white drop-shadow">
              אודות העסק
            </h2>
            <p className="mt-5 text-white/90 leading-8 drop-shadow">
              Binyanet נועדה להפוך ניהול ועד בית למשהו מסודר: פחות הודעות, פחות
              “מי מטפל בזה?”, ויותר תהליך ברור. כל תקלה מתועדת, מתקדמת בסטטוסים,
              והדייר רואה עדכון מהוועד במקום לרדוף אחרי תשובות.
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <Feature
                title="סדר וארגון"
                desc="כל המידע במקום אחד, בלי בלאגן."
              />
              <Feature
                title="שירות לדייר"
                desc="דייר פותח תקלה ורואה התקדמות."
              />
              <Feature title="ניהול ועד" desc="סטטוסים, הערות ועד ותיעוד." />
              <Feature
                title="מוכן לגדילה"
                desc="בהמשך: תשלומים, ספקים, מסמכים."
              />
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur rounded-2xl border border-white/40 shadow-lg p-7">
            <h3 className="text-xl font-extrabold text-right">איך זה עובד?</h3>
            <ol className="mt-5 space-y-4 text-right text-[#1F1F1F]">
              <li className="flex flex-row-reverse gap-3">
                <Step n="1" /> דייר מתחבר ופותח תקלה
              </li>
              <li className="flex flex-row-reverse gap-3">
                <Step n="2" /> הוועד רואה את כל התקלות בממשק אדמין
              </li>
              <li className="flex flex-row-reverse gap-3">
                <Step n="3" /> הוועד משנה סטטוס ומוסיף “הערת ועד”
              </li>
              <li className="flex flex-row-reverse gap-3">
                <Step n="4" /> הדייר רואה עדכון בטבלה באזור האישי
              </li>
            </ol>

            <div className="mt-8 flex flex-col sm:flex-row-reverse gap-3">
              <button
                onClick={goToArea}
                className="px-5 py-2.5 rounded-xl bg-[#1F1F1F] text-white hover:bg-black transition font-semibold"
              >
                כניסה לאזור האישי
              </button>
              <button
                onClick={() => scrollTo("contact")}
                className="px-5 py-2.5 rounded-xl border border-white/40 bg-white/70 hover:bg-white/90 transition font-semibold"
              >
                השארת פרטים
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="text-right">
          <h2 className="text-3xl font-extrabold text-white drop-shadow">
            שירותים עיקריים
          </h2>
          <p className="mt-4 text-white/90 leading-8 drop-shadow">
            דף נחיתה צריך להסביר מהר מה הערך — אלו היכולות המרכזיות כרגע.
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ServiceCard
            title="ניהול תקלות"
            desc="פתיחה, מעקב, סטטוסים ועדכון לדייר."
          />
          <ServiceCard
            title="ממשק ועד"
            desc="אזור אדמין לחברי ועד בלבד (הרשאות)."
          />
          <ServiceCard
            title="ניהול דיירים"
            desc="בסיס לניהול משתמשים והרשאות."
          />
          <ServiceCard
            title="הודעות"
            desc="תשתית לעדכונים מרוכזים לכל הדיירים."
          />
          <ServiceCard
            title="תיעוד ושקיפות"
            desc="כל פעולה נשמרת ומופיעה במערכת."
          />
          <ServiceCard
            title="מוכן להרחבה"
            desc="תשלומים/ספקים/מסמכים – בהמשך הפיתוח."
          />
        </div>
      </section>

      {/* CONTACT */}
      <section
        id="contact"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="text-right">
            <h2 className="text-3xl font-extrabold text-white drop-shadow">
              השארת פרטים
            </h2>
            <p className="mt-4 text-white/90 leading-8 drop-shadow">
              השאר/י פרטים ונחזור אליך עם הצגת מערכת קצרה + התאמה לבניין.
            </p>

            <div className="mt-8 bg-white/85 backdrop-blur border border-white/40 rounded-2xl p-6 text-right">
              <p className="font-semibold text-[#1F1F1F]">מה חשוב לנו לדעת?</p>
              <ul className="mt-3 text-[#1F1F1F]/70 text-sm space-y-2">
                <li>• שם + טלפון לחזרה</li>
                <li>• אימייל (אופציונלי)</li>
                <li>• מספר דירות/גודל בניין (אופציונלי)</li>
              </ul>
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur rounded-2xl border border-white/40 shadow-lg p-2">
            <LeadForm />
          </div>
        </div>
      </section>

      {loginOpen && <LoginModal onClose={() => setLoginOpen(false)} />}
    </div>
  );
}

/* UI helpers */
function Dot() {
  return (
    <span className="mt-2 w-2 h-2 rounded-full bg-[#1F1F1F] inline-block" />
  );
}

function Step({ n }) {
  return (
    <span className="w-7 h-7 rounded-full bg-[#1F1F1F] text-white flex items-center justify-center text-sm font-bold">
      {n}
    </span>
  );
}

function Stat({ title, value }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-black/30 backdrop-blur p-4 text-white">
      <div className="text-sm text-white/80">{title}</div>
      <div className="font-extrabold">{value}</div>
    </div>
  );
}

function Feature({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/85 backdrop-blur p-5 shadow-lg hover:shadow-xl transition">
      <div className="font-extrabold">{title}</div>
      <div className="text-sm text-[#1F1F1F]/70 mt-2 leading-6">{desc}</div>
    </div>
  );
}

function ServiceCard({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/85 backdrop-blur p-6 shadow-lg hover:shadow-xl transition">
      <div className="text-right">
        <div className="font-extrabold text-lg">{title}</div>
        <div className="text-[#1F1F1F]/70 mt-3 leading-7">{desc}</div>
      </div>
    </div>
  );
}
