import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";
import ProfilePanel from "./ProfilePanel";
import ChangePasswordPanel from "./ChangePasswordPanel";

const roleHome = {
  donor: "/donor/dashboard",
  charity: "/charity/dashboard",
  admin: "/admin/dashboard",
};

const navByRole = {
  donor: [
    { label: "Workspace", to: "/donor/dashboard" },
    { label: "Marketplace", to: "/donor/marketplace" },
    { label: "Create Listing", to: "/donor/create-listing" },
  ],
  charity: [{ label: "Food Network", to: "/charity/dashboard" }],
  admin: [{ label: "Command Center", to: "/admin/dashboard" }],
};

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = navByRole[user?.role] || [];
  const [profileOpen, setProfileOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const togglePasswordPanel = () => {
    setPasswordOpen((current) => !current);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-slate-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <Link to={roleHome[user?.role] || "/"} className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
              FF
            </span>
            <span>
              <span className="block text-sm font-black tracking-tight text-slate-950">FoodFlow</span>
              <span className="block text-xs text-slate-500">Surplus operations</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                {item.label}
                {active && <span className="h-2 w-2 rounded-full bg-emerald-600" />}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="truncate text-sm font-bold text-slate-900">
              {user?.organization_name || user?.full_name}
            </p>
            <p className="mt-0.5 text-xs capitalize text-slate-500">{user?.role}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
          >
            Sign out
          </button>
          <button
            type="button"
            onClick={togglePasswordPanel}
            className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            Change password
          </button>
          {passwordOpen && (
            <div className="mt-3 rounded-lg bg-slate-50 p-3">
              <ChangePasswordPanel compact />
            </div>
          )}
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            <Link to={roleHome[user?.role] || "/"} className="flex items-center gap-2 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
                FF
              </span>
              <span className="text-sm font-black text-slate-950">FoodFlow</span>
            </Link>

            <div className="hidden min-w-0 flex-1 lg:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Workspace</p>
              <h1 className="truncate text-sm font-bold text-slate-950">
                {user?.organization_name || user?.full_name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((current) => !current)}
                  aria-label="Open profile"
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black shadow-sm transition ${
                    profileOpen
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {(user?.organization_name || user?.full_name || "U").slice(0, 1).toUpperCase()}
                </button>

                {profileOpen && (
                  <div className="fixed right-4 top-16 z-[100] max-h-[calc(100vh-5rem)] w-[calc(100vw-2rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 shadow-2xl sm:absolute sm:right-0 sm:top-12 sm:w-[42rem]">
                    <ProfilePanel compact />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden"
              >
                Sign out
              </button>
              <button
                type="button"
                onClick={togglePasswordPanel}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 lg:hidden"
              >
                Password
              </button>
            </div>
          </div>

          {passwordOpen && (
            <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
              <ChangePasswordPanel compact />
            </div>
          )}

          <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold ${
                    active ? "bg-emerald-50 text-emerald-700" : "text-slate-600"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
