import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (user?.role === "donor") return "/donor/dashboard";
    if (user?.role === "charity") return "/charity/dashboard";
    if (user?.role === "admin") return "/admin/dashboard";
    return "/";
  };

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link to={user ? getDashboardLink() : "/"} className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-sm font-black text-white">
            FF
          </span>
          <span className="text-lg font-black text-slate-950">
            Food<span className="text-emerald-600">Flow</span>
          </span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          {!user ? (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-600 transition hover:text-slate-950">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
              >
                Get Started
              </Link>
            </>
          ) : (
            <Link
              to={getDashboardLink()}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              Open Workspace
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded-lg p-2 transition hover:bg-slate-100 md:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          <div className="mb-1 h-0.5 w-5 bg-slate-600" />
          <div className="mb-1 h-0.5 w-5 bg-slate-600" />
          <div className="h-0.5 w-5 bg-slate-600" />
        </button>
      </div>

      {menuOpen && (
        <div className="space-y-3 border-t border-slate-100 bg-white px-4 py-4 md:hidden">
          {!user ? (
            <>
              <Link to="/login" className="block py-2 text-sm font-semibold text-slate-700">
                Sign In
              </Link>
              <Link
                to="/register"
                className="block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-bold text-white"
              >
                Get Started
              </Link>
            </>
          ) : (
            <Link
              to={getDashboardLink()}
              className="block rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-bold text-white"
            >
              Open Workspace
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
