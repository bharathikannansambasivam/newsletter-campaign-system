import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import api from "../services/api";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ subject: "", content: "", scheduledAt: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | scheduling | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status === "error") setStatus("idle");
  };

  const createCampaign = async () => {
    const payload = {
      subject: form.subject,
      content: form.content,
      ...(form.scheduledAt && { scheduledAt: new Date(form.scheduledAt).toISOString() }),
    };
    const res = await api.post("/campaign", payload);
    return res.data;
  };

  const handleSendNow = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.content.trim()) {
      setErrorMsg("Subject and content are required.");
      setStatus("error");
      return;
    }
    setStatus("sending");
    setErrorMsg("");
    try {
      const campaign = await createCampaign();
      await api.post(`/campaign/${campaign._id}/send`);
      setStatus("success");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to send campaign.");
      setStatus("error");
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.content.trim()) {
      setErrorMsg("Subject and content are required.");
      setStatus("error");
      return;
    }
    if (!form.scheduledAt) {
      setErrorMsg("Please set a scheduled time.");
      setStatus("error");
      return;
    }
    setStatus("scheduling");
    setErrorMsg("");
    try {
      await createCampaign();
      setStatus("success");
      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Failed to schedule campaign.");
      setStatus("error");
    }
  };

  const isBusy = status === "sending" || status === "scheduling";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Campaign</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the details to send or schedule a newsletter</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          {status === "success" ? (
            <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">Campaign created!</h3>
              <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
            </div>
          ) : (
            <form className="p-6 sm:p-8 flex flex-col gap-6">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="e.g. Weekly digest — March 2026"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm transition"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="content"
                  value={form.content}
                  onChange={handleChange}
                  placeholder="Write your newsletter content here..."
                  required
                  rows={8}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm transition resize-y"
                />
              </div>

              {/* Scheduled time */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Scheduled time{" "}
                  <span className="text-gray-400 font-normal">(optional — required for Schedule)</span>
                </label>
                <input
                  type="datetime-local"
                  name="scheduledAt"
                  value={form.scheduledAt}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent text-gray-800 text-sm transition"
                />
              </div>

              {/* Error */}
              {status === "error" && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3">
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleSendNow}
                  disabled={isBusy}
                  className="bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm shadow-orange-200 text-sm flex items-center gap-2"
                >
                  {status === "sending" ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Now
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSchedule}
                  disabled={isBusy}
                  className="bg-white hover:bg-gray-50 disabled:bg-gray-50 border border-gray-200 text-gray-700 font-semibold px-6 py-3 rounded-xl transition-colors text-sm flex items-center gap-2"
                >
                  {status === "scheduling" ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Schedule
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
