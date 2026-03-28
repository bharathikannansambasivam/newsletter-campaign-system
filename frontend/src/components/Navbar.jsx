import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const companyName = localStorage.getItem("companyName");

  const guestLinks = [
    { to: "/", label: "Landing" },
    { to: "/login", label: "Log In" },
    { to: "/signup", label: "Sign Up" },
  ];

  const authLinks = [
    { to: "/", label: "Landing" },
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
    navigate("/");
  };

  return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
      <Link to="/" className="text-xl font-bold text-orange-500 tracking-tight">
        Newsletter Campaign
      </Link>
      <div className="flex items-center gap-1">
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
    </nav>
  );
}
