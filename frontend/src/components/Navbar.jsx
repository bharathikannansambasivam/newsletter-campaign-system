import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const companyName = localStorage.getItem("companyName");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const guestLinks = [
    { to: "/", label: "Home" },
    { to: "/login", label: "Log In" },
    { to: "/signup", label: "Sign Up" },
  ];

  const authLinks = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
    { to: "/create-campaign", label: "Create Campaign" },
  ];

  const links = companyName ? authLinks : guestLinks;

  const handleLogout = async () => {
    try {
      await api.post("/company/logout");
    } catch {
      // ignore — clear client state regardless
    }
    localStorage.removeItem("companyName");
    setMenuOpen(false);
    navigate("/");
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 relative" ref={menuRef}>
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-orange-500 tracking-tight">
          Newsletter Campaign
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === to
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          ))}
          {companyName && (
            <>
              <span className="px-3 py-2 text-sm text-gray-400">{companyName}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Hamburger button (mobile) */}
        <button
          className="md:hidden flex flex-col justify-center items-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-1.5" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-600 my-1 transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-1.5" : ""
            }`}
          />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          menuOpen ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <div className="flex flex-col gap-1 pb-2">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === to
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          ))}
          {companyName && (
            <>
              <span className="px-4 py-2 text-sm text-gray-400 border-t border-gray-100 mt-1 pt-3">
                {companyName}
              </span>
              <button
                onClick={handleLogout}
                className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
