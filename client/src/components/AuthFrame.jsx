import { Link } from "react-router-dom";

const AuthFrame = ({ title, subtitle, eyebrow, children, footer, compact = false, contentClassName = "max-w-md" }) => {
  const shellHeight = compact ? "lg:min-h-[500px]" : "lg:min-h-[600px]";
  const sidePadding = compact ? "p-7" : "p-9";
  const sideTitle = compact ? "text-3xl" : "text-4xl";
  const contentHeight = compact ? "min-h-0" : "min-h-[560px]";
  const contentPadding = compact ? "px-5 py-4 sm:px-7 lg:px-8" : "px-5 py-6 sm:px-9 lg:px-12";

  return (
    <div className="min-h-screen bg-[#eef4ec] px-4 py-4">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-5xl items-center justify-center">
        <section className={`grid w-full overflow-hidden rounded-2xl border border-[#d8e1d4] bg-[#fffffb] shadow-xl shadow-[#18251d]/12 ${shellHeight} lg:grid-cols-[0.9fr_1.1fr]`}>
          <div className={`relative hidden overflow-hidden bg-[#13251c] ${sidePadding} text-white lg:block`}>
            <div className="absolute bottom-0 left-0 h-28 w-full bg-[#1d6f49]/35" />
            <div className="absolute left-10 top-10 h-12 w-12 rounded-lg bg-[#d8f3dc] text-center text-sm font-black leading-[3rem] text-[#13251c]">
              FF
            </div>
            <div className="relative z-10 flex h-full max-w-[25rem] flex-col justify-center pr-4 xl:max-w-md">
              <p className="text-xs font-bold uppercase tracking-[0.26em] text-[#a9d8b8]">{eyebrow}</p>
              <h1 className={`mt-4 ${sideTitle} font-black leading-tight tracking-tight`}>FoodFlow</h1>
              <p className="mt-3 max-w-[22rem] text-sm font-semibold leading-6 text-white/85">
                Surplus food operations, verified and organized.
              </p>
              <p className="mt-4 text-sm leading-6 text-white/62">
                Manage listings, donations, marketplace purchases, and waste impact from one calm workspace.
              </p>
              <div className={`${compact ? "mt-5" : "mt-7"} grid grid-cols-3 gap-2`}>
                {["Safety", "Expiry", "Impact"].map((item) => (
                  <div key={item} className="min-w-0 rounded-lg border border-white/10 bg-white/8 px-2.5 py-2.5">
                    <p className="truncate text-xs font-bold text-white/75">{item}</p>
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
                <h2 className="mt-1.5 text-2xl font-black tracking-tight text-[#18211c]">{title}</h2>
                <p className="mt-1.5 text-sm leading-5 text-[#6b766b]">{subtitle}</p>
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
