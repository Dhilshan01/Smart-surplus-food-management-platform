import { Link } from "react-router-dom";
import landingVideo from "../../Logos/Landing_page.mp4";

const metrics = [
  { value: "1 in 3", label: "Meals produced globally are wasted", delay: "animate-delay-100" },
  { value: "820M+", label: "People face hunger worldwide", delay: "animate-delay-200" },
  { value: "Real-time", label: "Safety and expiry monitoring", delay: "animate-delay-300" },
  { value: "3 roles", label: "Donors, charities, and admins", delay: "animate-delay-400" },
];

const roles = [
  {
    title: "Donors & businesses",
    description: "Post surplus food, choose donation or sale, track collections, and measure recovered value.",
    items: ["Create listings", "Sell surplus stock", "Donate to charities", "View waste analytics"],
    accent: "from-emerald-500 to-teal-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5 12 4l9 5.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z" />
      </svg>
    ),
  },
  {
    title: "Charity organizations",
    description: "Browse safe donation listings, claim food, and manage collection status from one workspace.",
    items: ["Find donations", "Claim food", "Track collections", "Prioritize urgent listings"],
    accent: "from-teal-500 to-cyan-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10Z" />
      </svg>
    ),
  },
  {
    title: "Administrators",
    description: "Oversee users, listings, claims, and complaints while monitoring platform-wide sustainability metrics.",
    items: ["Manage users", "Review listings", "Handle complaints", "Platform analytics"],
    accent: "from-emerald-600 to-green-700",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" stroke="currentColor" strokeWidth="1.75">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.03 1.51 1.03H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
];

const workflow = [
  {
    step: "01",
    title: "Register",
    description: "Businesses, charities, and admins access role-specific dashboards after authentication.",
  },
  {
    step: "02",
    title: "List surplus food",
    description: "Enter food details, quantity, pickup location, expiry time, storage conditions, and listing type.",
  },
  {
    step: "03",
    title: "Score safety",
    description: "The platform calculates a live score using preparation time, expiry time, and storage conditions.",
  },
  {
    step: "04",
    title: "Redistribute",
    description: "Businesses purchase sale listings, while charities claim donation listings before collection.",
  },
];

const modules = [
  {
    title: "Surplus listing management",
    description: "Create, edit, and track food listings with expiry-aware status updates.",
    span: "sm:col-span-2",
  },
  {
    title: "B2B marketplace",
    description: "Discounted sales between businesses before food expires.",
    span: "",
  },
  {
    title: "Charity claim workflow",
    description: "Ranked matches help charities find the most urgent, safe donations.",
    span: "",
  },
  {
    title: "Safety scoring",
    description: "Every listing receives a risk category based on shelf life and storage.",
    span: "sm:col-span-2",
  },
  {
    title: "Waste analytics",
    description: "Measure recovered value, donations, and expired food over time.",
    span: "sm:col-span-2",
  },
];

const safetyLevels = [
  {
    label: "Safe",
    range: "80–100",
    description: "Good remaining shelf life. Suitable for sale or donation.",
    className: "border-emerald-200/80 bg-emerald-50 text-emerald-800",
    bar: "w-[92%] bg-emerald-500",
  },
  {
    label: "Moderate Risk",
    range: "50–79",
    description: "Needs quick action. Prioritize collection before expiry.",
    className: "border-amber-200/80 bg-amber-50 text-amber-800",
    bar: "w-[65%] bg-amber-500",
  },
  {
    label: "Unsafe",
    range: "0–49",
    description: "High risk or expired. Avoid redistribution and handle safely.",
    className: "border-red-200/80 bg-red-50 text-red-800",
    bar: "w-[28%] bg-red-500",
  },
];

const SectionLabel = ({ children }) => (
  <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
    <span className="h-px w-6 bg-emerald-400" />
    {children}
  </p>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-[#f8faf8] text-slate-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={landingVideo}
          autoPlay
          muted
          loop
          playsInline
          aria-hidden="true"
        />
        <div className="hero-mesh pointer-events-none absolute inset-0" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#0f1f17]/92 via-[#13251c]/78 to-emerald-950/65" />

        <div className="relative mx-auto flex min-h-[calc(100vh-65px)] max-w-7xl items-center px-4 py-20 lg:py-24">
          <div className="max-w-3xl">
            <div className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-200 backdrop-blur-sm">
              <span className="animate-status-pulse h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Smart surplus food management
            </div>

            <h1 className="animate-fade-up animate-delay-100 mt-6 text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
              Turn surplus food into{" "}
              <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-emerald-400 bg-clip-text text-transparent">
                real impact
              </span>
            </h1>

            <p className="animate-fade-up animate-delay-200 mt-6 max-w-xl text-lg leading-relaxed text-white/75">
              FoodFlow connects donors, charities, and administrators through B2B sales, donation
              claims, expiry tracking, food safety scoring, and waste analytics.
            </p>

            <div className="animate-fade-up animate-delay-300 mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="interactive-lift inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-950/30 transition hover:bg-emerald-400"
              >
                Get started free
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                </svg>
              </Link>
              <Link
                to="/login"
                className="interactive-lift inline-flex justify-center rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-black text-white backdrop-blur-sm transition hover:bg-white/15"
              >
                Sign in
              </Link>
            </div>

            <div className="animate-fade-up animate-delay-400 mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-white/55">
              {["No credit card required", "Role-based dashboards", "Live safety scoring"].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-emerald-400">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                  </svg>
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8faf8] to-transparent" />
      </section>

      {/* Metrics */}
      <section className="relative z-10 -mt-6 px-4 pb-4">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className={`interactive-lift animate-fade-up ${metric.delay} rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm shadow-slate-200/50`}
            >
              <p className="text-3xl font-black tracking-tight text-[#13251c]">{metric.value}</p>
              <p className="mt-1.5 text-sm font-semibold leading-snug text-slate-500">{metric.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roles */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <SectionLabel>User roles</SectionLabel>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-[#13251c] sm:text-4xl">
              Built for every participant in the redistribution chain
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-600">
              Each role gets a dedicated workspace with the tools they need — from listing surplus
              stock to claiming donations and overseeing the platform.
            </p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {roles.map((role) => (
              <article
                key={role.title}
                className="interactive-lift group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${role.accent} p-3 text-white shadow-lg`}>
                  {role.icon}
                </div>
                <h3 className="text-lg font-black text-[#13251c]">{role.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{role.description}</p>
                <ul className="mt-6 space-y-2.5">
                  {role.items.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-emerald-100/40 blur-2xl transition group-hover:bg-emerald-200/50" />
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="border-y border-slate-200/80 bg-white px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[340px_1fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <SectionLabel>How it works</SectionLabel>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#13251c] sm:text-4xl">
                From surplus food to measurable impact
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                A simple four-step workflow so food can be listed, scored, reserved, collected, and
                reported before it expires.
              </p>
              <Link
                to="/register"
                className="interactive-lift mt-8 inline-flex items-center gap-2 text-sm font-black text-emerald-700 transition hover:text-emerald-600"
              >
                Start the workflow
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            <div className="relative space-y-0">
              <div className="absolute bottom-4 left-[27px] top-4 hidden w-px bg-gradient-to-b from-emerald-300 via-emerald-200 to-transparent lg:block" />
              {workflow.map((item, index) => (
                <article
                  key={item.step}
                  className={`interactive-lift relative flex gap-5 pb-8 last:pb-0 ${index === 0 ? "" : "pt-0"}`}
                >
                  <div className="relative z-10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-lg font-black text-emerald-700 shadow-sm">
                    {item.step}
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-[#f8faf8] p-5 pt-4 sm:flex-1">
                    <h3 className="text-base font-black text-[#13251c]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Modules bento + Safety */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_420px] lg:gap-10">
            <div>
              <SectionLabel>Core modules</SectionLabel>
              <h2 className="mt-4 text-3xl font-black tracking-tight text-[#13251c] sm:text-4xl">
                Everything you need in one platform
              </h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {modules.map((module) => (
                  <div
                    key={module.title}
                    className={`interactive-lift rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${module.span}`}
                  >
                    <span className="inline-block h-1 w-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400" />
                    <h3 className="mt-4 text-sm font-black text-[#13251c]">{module.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{module.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-[#13251c] p-6 text-white shadow-xl shadow-[#13251c]/20 lg:sticky lg:top-24 lg:self-start">
              <SectionLabel>
                <span className="text-emerald-300">Food safety scoring</span>
              </SectionLabel>
              <h3 className="mt-4 text-2xl font-black tracking-tight">Every listing gets a risk category</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65">
                Scores combine preparation time, time remaining before expiry, storage conditions,
                and food category — clamped to 0–100 with clear Safe, Moderate, and Unsafe bands.
              </p>

              <div className="mt-8 space-y-4">
                {safetyLevels.map((level) => (
                  <div key={level.label} className={`rounded-xl border p-4 ${level.className}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black">{level.label}</p>
                      <p className="rounded-full bg-white/60 px-2 py-0.5 text-xs font-black">{level.range}</p>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/10">
                      <div className={`h-full rounded-full ${level.bar}`} />
                    </div>
                    <p className="mt-2.5 text-sm leading-relaxed opacity-90">{level.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-4">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#13251c] via-[#1a3828] to-emerald-900 px-6 py-14 sm:px-10 lg:py-16">
          <div className="hero-mesh pointer-events-none absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-300">Ready to begin</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight text-white sm:text-4xl">
                Reduce waste while improving redistribution decisions
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/65">
                Register as a food donor or charity organization and start using the platform workflow today.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <Link
                to="/register"
                className="interactive-lift inline-flex justify-center rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-white shadow-lg transition hover:bg-emerald-400"
              >
                Create account
              </Link>
              <Link
                to="/login"
                className="interactive-lift inline-flex justify-center rounded-xl border border-white/20 px-6 py-3.5 text-sm font-black text-white transition hover:bg-white/10"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 py-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#13251c] text-sm font-black text-white">
              FF
            </span>
            <div>
              <p className="text-sm font-black text-[#13251c]">FoodFlow</p>
              <p className="text-xs font-semibold text-slate-500">Smart food redistribution</p>
            </div>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-slate-600">
            <Link to="/" className="transition hover:text-[#13251c]">Home</Link>
            <Link to="/register" className="transition hover:text-[#13251c]">Register</Link>
            <Link to="/login" className="transition hover:text-[#13251c]">Sign in</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
