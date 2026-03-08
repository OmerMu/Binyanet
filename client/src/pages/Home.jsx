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
    if (user.role === "company") return navigate("/company");
    if (user.role === "committee") return navigate("/committee");
    return navigate("/tenant");
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
                פחות הודעות מבוזרות, פחות אי־בהירות, ויותר תהליך מסודר: הדיירים
                פותחים קריאות שירות, הנהלת הבניין מעדכנת סטטוס ומוסיפה הערות –
                .וכל המידע נשמר בצורה מתועדת ושקופה
              </p>
              <p className="mt-5 text-lg text-white/80 drop-shadow">
                מותאם לבנייני מגורים קטנים ובינוניים · ממשק רספונסיבי לנייד
                ולדסקטופ · ניהול מאובטח באמצעות JWT והרשאות מתקדמות
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
                <Stat title="ניהול תקלות" value="תיעוד מלא ומעקב סטטוסים" />
                <Stat title="ניהול משתמשים" value="חלוקת הרשאות לפי תפקיד" />
                <Stat title="שקיפות מלאה" value="עדכונים בזמן אמת לדיירים" />
              </div>
            </div>

            {/* Right card */}
            <div className="bg-white/85 backdrop-blur rounded-2xl shadow-lg border border-white/40 p-7 lg:p-9">
              <h3 className="text-2xl font-extrabold text-right text-[#1F1F1F]">
                מה מקבלים בפועל?
              </h3>

              <ul className="mt-5 space-y-3 text-right text-[#1F1F1F]">
                <li className="flex flex-row-reverse gap-3">
                  <Dot /> פתיחת קריאות שירות על ידי דיירים בצורה פשוטה וברורה
                </li>
                <li className="flex flex-row-reverse gap-3">
                  <Dot />
                  עדכון סטטוס טיפול והוספת הערות רשמיות מטעם הנהלת הבניין
                </li>
                <li className="flex flex-row-reverse gap-3">
                  <Dot /> אזור ניהול ייעודי לבעלי הרשאות בלבד
                </li>
                <li className="flex flex-row-reverse gap-3">
                  <Dot /> תשתית להרחבות עתידיות: תשלומים, ספקים, מסמכים וניהול
                  מתקדם
                </li>
              </ul>

              <div className="mt-7 p-5 rounded-2xl bg-white/70 border border-white/40 text-right">
                <p className="text-[#1F1F1F]/70 text-lg mt-1 leading-6">
                  .השאר פרטים ונחזור אליך עם הצגת מערכת קצרה + התאמה לבניין
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
              המערכת פותחה מתוך מטרה לייעל ולמקצע את ניהול הבניין שלכם. המערכת
              מצמצמת אי בהירויות, מונעת עיכובים בטיפול תקלות ויוצרת תהליך עבודה
              ברור ומתועד. כל קריאת שירות מנוהלת בצורה מסודרת - משלב הפתיחה ועד
              .לסגירת מעגל טיפול
            </p>

            <div className="mt-8 grid sm:grid-cols-2 gap-4">
              <Feature
                title="סדר וארגון"
                desc="כל הנתונים מרוכזים במערכת אחת, בצורה מסודרת ונגישה"
              />
              <Feature
                title="שירות לדייר"
                desc="דיירים פותחים קריאות שירות ועוקבים אחר התקדמות הטיפול"
              />
              <Feature
                title="ניהול ועד"
                desc="ניהול סטטוסים, תיעוד פעולות והוספת הערות רשמיות"
              />
              <Feature
                title="מוכן לגדילה"
                desc="המערכת בנויה להתרחבות עתידית בהתאם לצורכי הבניין"
              />
            </div>
          </div>

          <div className="bg-white/85 backdrop-blur rounded-2xl border border-white/40 shadow-lg p-7">
            <h3 className="text-xl font-extrabold text-right">
              ? איך זה עובד{" "}
            </h3>
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
            היכולות המרכזיות של המערכת לניהול יעיל, מסודר ושקוף של הבניין
          </p>
        </div>

        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <ServiceCard
            title="ניהול תקלות"
            desc="פתיחת קריאות שירות, מעקב אחר סטטוס ועדכון הדיירים בזמן אמת"
          />
          <ServiceCard
            title="ממשק ועד"
            desc="אזור ניהול ייעודי לחברי הנהלה בעלי הרשאות"
          />
          <ServiceCard
            title="ניהול דיירים"
            desc="ניהול משתמשים והרשאות בהתאם לתפקידי המערכת"
          />
          <ServiceCard
            title="הודעות"
            desc="תשתית לעדכונים מרוכזים לכל הדיירים"
          />
          <ServiceCard
            title="תיעוד ושקיפות"
            desc="כל פעולה נשמרת ומופיעה במערכת"
          />
          <ServiceCard
            title="מוכן להרחבה"
            desc="תשלומים/ספקים/מסמכים – בהמשך הפיתוח"
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
              השאירו פרטים ונחזור אליכם לתיאום הצגת מערכת והתאמה לצורכי הבניין
            </p>

            <div className="mt-8 bg-white/85 backdrop-blur border border-white/40 rounded-2xl p-6 text-right">
              <p className="font-semibold text-[#1F1F1F]">
                : כדי להתאים את המערכת לבניין שלכם, נשמח לדעת
              </p>
              <ul className="mt-3 text-[#1F1F1F]/70 text-sm space-y-2">
                <li>שם + טלפון לחזרה</li>
                <li>אימייל (אופציונלי)</li>
                <li>מספר דירות/גודל בניין (אופציונלי)</li>
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
