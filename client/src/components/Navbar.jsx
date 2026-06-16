import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import NotificationBell from "./NotificationBell";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (user?.role === "donor") return "/donor/dashboard";
    if (user?.role === "charity") return "/charity/dashboard";
    if (user?.role === "admin") return "/admin/dashboard";
    return "/";
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to={user ? getDashboardLink() : "/"} className="flex items-center gap-2">
          <span className="text-2xl">🍱</span>
          <span className="font-bold text-gray-900 text-lg">
            Food<span className="text-green-600">Share</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              <Link to="/about" className="text-sm text-gray-500 hover:text-gray-800 transition">
                About
              </Link>
              <Link
                to="/login"
                className="text-sm text-gray-700 font-medium hover:text-gray-900 transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-sm bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition"
              >
                Get Started
              </Link>
            </>
          ) : (
            <>
              <Link
                to={getDashboardLink()}
                className="text-sm text-gray-500 hover:text-gray-800 font-medium transition"
              >
                Dashboard
              </Link>
              {user.role === "donor" && (
                <Link
                  to="/donor/create-listing"
                  className="text-sm text-gray-500 hover:text-gray-800 font-medium transition"
                >
                  Post Food
                </Link>
              )}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                <div className="text-right hidden lg:block">
                  <p className="text-xs font-semibold text-gray-800">
                    {user.organization_name || user.full_name}
                  </p>
                  <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                </div>
                <NotificationBell />
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-500 hover:text-red-700 font-medium transition"
                >
                  Logout
                </button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <div className="w-5 h-0.5 bg-gray-600 mb-1" />
          <div className="w-5 h-0.5 bg-gray-600 mb-1" />
          <div className="w-5 h-0.5 bg-gray-600" />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          {!user ? (
            <>
              <Link to="/login" className="block text-sm text-gray-700 font-medium py-2">Sign In</Link>
              <Link to="/register" className="block text-sm bg-green-600 text-white font-semibold px-4 py-2 rounded-lg text-center">Get Started</Link>
            </>
          ) : (
            <>
              <Link to={getDashboardLink()} className="block text-sm text-gray-700 py-2">Dashboard</Link>
              {user.role === "donor" && (
                <Link to="/donor/create-listing" className="block text-sm text-gray-700 py-2">Post Food</Link>
              )}
              <button onClick={handleLogout} className="block text-sm text-red-500 font-medium py-2">Logout</button>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;