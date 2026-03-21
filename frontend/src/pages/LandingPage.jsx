import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function LandingPage() {
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-xl w-full">
          <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full mb-6 tracking-wide uppercase">
            Newsletter Platform
          </span>

          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-4">
            Newsletter <span className="text-orange-500">Campaign</span>
          </h1>

          <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
            Send beautiful newsletter campaigns to your audience. Manage subscribers, schedule emails, and track delivery — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setShowInfo((v) => !v)}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm shadow-orange-200 text-sm whitespace-nowrap"
            >
              Subscribe
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 font-semibold px-6 py-3 rounded-xl border border-gray-200 transition-colors shadow-sm text-sm whitespace-nowrap"
            >
              Company Login
            </button>
          </div>

          {showInfo && (
            <div className="mt-6 bg-white border border-orange-100 rounded-2xl px-6 py-4 shadow-sm text-sm text-gray-500 max-w-md mx-auto">
              To subscribe, use the link provided by your company:
              <code className="block mt-2 bg-orange-50 text-orange-600 rounded-lg px-3 py-2 font-mono text-xs">
                /subscribe/:company
              </code>
              <span className="block mt-1 text-xs text-gray-400">e.g. /subscribe/nike or /subscribe/google</span>
            </div>
          )}

          <p className="mt-6 text-xs text-gray-400">No spam, ever. Unsubscribe at any time.</p>
        </div>
      </main>
    </div>
  );
}
