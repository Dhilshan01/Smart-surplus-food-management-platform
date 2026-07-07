import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const reasons = [
  { value: "fake_listing", label: "Fake listing" },
  { value: "expired_food", label: "Expired food" },
  { value: "unsafe_food", label: "Unsafe food" },
  { value: "wrong_details", label: "Wrong quantity/details" },
  { value: "suspicious_business", label: "Suspicious business" },
  { value: "other", label: "Other" },
];

const ReportListingButton = ({ listingId, listingTitle, onReported, compact = false }) => {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("fake_listing");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submitReport = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post(
        "/api/complaints",
        { listing_id: listingId, reason, description },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setOpen(false);
      setDescription("");
      onReported?.();
      alert("Report submitted for admin review.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
            : "flex-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-black text-amber-700 transition hover:bg-amber-100"
        }
      >
        Report
      </button>

      {open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
          <form onSubmit={submitReport} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Complaint</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">Report listing</h2>
                <p className="mt-1 text-sm text-slate-500">{listingTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-sm font-black text-slate-500 hover:bg-slate-50"
                aria-label="Close report"
              >
                x
              </button>
            </div>

            {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

            <div className="mt-4 space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Reason</label>
                <select
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                >
                  {reasons.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Details</label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  placeholder="Explain what looks wrong or unsafe."
                  className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                />
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-black text-white hover:bg-amber-700 disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default ReportListingButton;
