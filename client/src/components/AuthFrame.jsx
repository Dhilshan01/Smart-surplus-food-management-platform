import { Link } from "react-router-dom";

const AuthFrame = ({ title, subtitle, eyebrow, children, footer, compact = false, contentClassName = "max-w-md" }) => {
  const shellHeight = compact ? "lg:min-h-[580px]" : "lg:min-h-[680px]";
  const sidePadding = compact ? "p-8" : "p-10";
  const sideTitle = compact ? "text-4xl" : "text-5xl";
  const contentHeight = compact ? "min-h-0" : "min-h-[640px]";
  const contentPadding = compact ? "px-5 py-5 sm:px-8 lg:px-10" : "px-5 py-7 sm:px-10 lg:px-14";

  return (
    <div className="min-h-screen bg-[#eef4ec] px-4 py-5 sm:py-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <section className={`grid w-full overflow-hidden rounded-[28px] border border-[#d8e1d4] bg-[#fffffb] shadow-2xl shadow-[#18251d]/15 ${shellHeight} lg:grid-cols-[0.95fr_1.05fr]`}>
          <div className={`relative hidden overflow-hidden bg-[#13251c] ${sidePadding} text-white lg:block`}>
            <div className="absolute inset-y-0 right-[-18%] w-[46%] rounded-l-[120px] bg-[#fffffb]" />
            <div className="absolute bottom-0 left-0 h-28 w-full bg-[#1d6f49]/35" />
            <div className="absolute left-10 top-10 h-12 w-12 rounded-lg bg-[#d8f3dc] text-center text-sm font-black leading-[3rem] text-[#13251c]">
              FF
            </div>
            <div className="relative z-10 flex h-full max-w-sm flex-col justify-center">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#a9d8b8]">{eyebrow}</p>
              <h1 className={`mt-5 ${sideTitle} font-black leading-tight tracking-tight`}>FoodFlow</h1>
              <p className="mt-4 text-base font-semibold text-white/85">Surplus food operations, verified and organized.</p>
              <p className="mt-5 text-sm leading-7 text-white/62">
                Manage listings, donations, marketplace purchases, and waste impact from one calm workspace.
              </p>
              <div className={`${compact ? "mt-6" : "mt-8"} grid grid-cols-3 gap-3`}>
                {["Safety", "Expiry", "Impact"].map((item) => (
                  <div key={item} className="rounded-lg border border-white/10 bg-white/8 px-3 py-3">
                    <p className="text-xs font-bold text-white/75">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`flex ${contentHeight} flex-col justify-center ${contentPadding}`}>
            <Link to="/" className={`${compact ? "mb-5" : "mb-8"} inline-flex items-center gap-2 self-start lg:hidden`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#13251c] text-sm font-black text-white">FF</span>
              <span className="text-sm font-black text-[#18211c]">FoodFlow</span>
            </Link>
            <div className={`mx-auto w-full ${contentClassName}`}>
              <div className={compact ? "mb-4" : "mb-6"}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">{eyebrow}</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-[#18211c]">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#6b766b]">{subtitle}</p>
              </div>
              {children}
              {footer && <div className={compact ? "mt-4" : "mt-6"}>{footer}</div>}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AuthFrame;
