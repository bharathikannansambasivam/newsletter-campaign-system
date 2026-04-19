import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

const STATUS_STYLES = {
  processing: "bg-yellow-100 text-yellow-700",
  sent: "bg-blue-100 text-blue-600",
  completed: "bg-green-100 text-green-700",
  scheduled: "bg-purple-100 text-purple-600",
  draft: "bg-gray-100 text-gray-600",
  failed: "bg-red-100 text-red-600",
};

export default function Dashboard() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(null); // campaign id currently being sent

  useEffect(() => {
    api
      .get("/campaigns")
      .then((res) => setCampaigns(res.data))
      .catch(() => setError("Failed to load campaigns."))
      .finally(() => setLoading(false));
  }, []);

  const handleSend = async (campaign) => {
    setSending(campaign._id);
    try {
      await api.post(`/campaign/${campaign._id}/send`);
      setCampaigns((prev) =>
        prev.map((c) =>
          c._id === campaign._id ? { ...c, status: "processing" } : c
        )
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to send campaign.");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">
              All your newsletter campaigns
            </p>
          </div>
          <Link
            to="/create-campaign"
            className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-orange-200 flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Campaign
          </Link>
        </div>
        <div className="mb-4 p-3 rounded-lg bg-yellow-100 border border-yellow-300 text-yellow-800 text-sm">
          ⚠️ Due to AWS SES sandbox, emails are limited to verified recipients
          (demo mode).{" "}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Campaigns</h2>
            <span className="text-xs text-gray-400">
              {campaigns.length} total
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-2">
              <svg
                className="animate-spin h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
              Loading campaigns...
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-500 text-sm">
              {error}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-sm mb-4">No campaigns yet.</p>
              <Link
                to="/create-campaign"
                className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                Create your first campaign
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {campaigns.map((c) => (
                <li
                  key={c._id}
                  className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 text-sm truncate">
                      {c.subject}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Created: {new Date(c.createdAt).toLocaleDateString()}
                      {c.scheduledAt &&
                        ` · Scheduled: ${new Date(
                          c.scheduledAt
                        ).toLocaleString()}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                        STATUS_STYLES[c.status] ?? STATUS_STYLES.draft
                      }`}
                    >
                      {c.status}
                    </span>

                    <Link
                      to={`/campaign/${c._id}/stats`}
                      className="text-xs text-orange-500 hover:text-orange-600 font-medium px-3 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                    >
                      Stats
                    </Link>

                    {c.status === "draft" && (
                      <button
                        onClick={() => handleSend(c)}
                        disabled={sending === c._id}
                        className="text-xs bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-3 py-1 rounded-lg transition-colors flex items-center gap-1"
                      >
                        {sending === c._id ? (
                          <>
                            <svg
                              className="animate-spin h-3 w-3"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          "Send"
                        )}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
