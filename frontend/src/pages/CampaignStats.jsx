import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const STAT_CARDS = [
  { key: "total",   label: "Total",   color: "bg-gray-100 text-gray-700" },
  { key: "sent",    label: "Sent",    color: "bg-blue-100 text-blue-700" },
  { key: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  { key: "failed",  label: "Failed",  color: "bg-red-100 text-red-700" },
];

export default function CampaignStats() {
  const { id } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/campaign/${id}/stats`)
      .then((res) => setStats(res.data))
      .catch(() => setError("Failed to load stats."))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center gap-3 mb-8">
          <Link to="/dashboard" className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaign Stats</h1>
            <p className="text-sm text-gray-500 mt-0.5 font-mono">{id}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Loading stats...
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 text-sm">{error}</div>
        ) : (
          <>
            {/* Success rate banner */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-4 flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Success rate</span>
              <span className="text-3xl font-bold text-green-500">{stats.successPercentage}</span>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              {STAT_CARDS.map(({ key, label, color }) => (
                <div key={key} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-bold text-gray-800">{stats[key]}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${color}`}>
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
