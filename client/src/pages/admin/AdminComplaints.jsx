import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const statusColor = {
  available: "bg-green-100 text-green-700",
  claimed: "bg-blue-100 text-blue-700",
  collected: "bg-gray-100 text-gray-700",
  expired: "bg-red-100 text-red-700",
  flagged: "bg-amber-100 text-amber-700",
};

const complaintStatusColor = {
  pending: "bg-yellow-100 text-yellow-700",
  reviewing: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  rejected: "bg-gray-100 text-gray-700",
};

const complaintReasonLabel = {
  fake_listing: "Fake listing",
  expired_food: "Expired food",
  unsafe_food: "Unsafe food",
  wrong_details: "Wrong details",
  suspicious_business: "Suspicious business",
  other: "Other",
};

const AdminComplaints = () => {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/complaints", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setComplaints(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComplaints();
  }, [fetchComplaints]);

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();
    return complaints.filter((complaint) => {
      const haystack = [
        complaint.title,
        complaint.city,
        complaint.food_category,
        complaint.reporter_name,
        complaint.reporter_email,
        complaint.donor_org,
        complaint.donor_name,
        complaint.reason,
        complaint.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (!statusFilter || complaint.status === statusFilter) && (!query || haystack.includes(query));
    });
  }, [complaints, search, statusFilter]);

  const counts = useMemo(
    () =>
      ["pending", "reviewing", "resolved", "rejected"].reduce(
        (summary, status) => ({
          ...summary,
          [status]: complaints.filter((item) => item.status === status).length,
        }),
        { total: complaints.length },
      ),
    [complaints],
  );

  const handleComplaintUpdate = async (id, payload) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/complaints/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComplaints();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update complaint");
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Admin review</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Complaints</h1>
          <p className="mt-1 text-sm text-slate-500">Review fake listings, unsafe food reports, and suspicious activity.</p>
        </div>
        <button
          type="button"
          onClick={fetchComplaints}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total", counts.total],
          ["Pending", counts.pending],
          ["Reviewing", counts.reviewing],
          ["Resolved", counts.resolved],
          ["Rejected", counts.rejected],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_auto]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search listing, reporter, poster, reason..."
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setStatusFilter("");
            }}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-sm font-semibold text-slate-500">Loading complaints...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Listing", "Reporter", "Reason", "Details", "Status", "Actions"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="align-top transition hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <p className="font-black text-slate-950">{complaint.title}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        #{complaint.listing_id} · {complaint.city || "No city"} · {complaint.food_category || "No category"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Poster: {complaint.donor_org || complaint.donor_name}
                      </p>
                      <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${statusColor[complaint.listing_status] || "bg-slate-100 text-slate-700"}`}>
                        {complaint.listing_status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      <p className="font-semibold text-slate-700">{complaint.reporter_name || "Deleted user"}</p>
                      <p className="text-xs">{complaint.reporter_email}</p>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {complaintReasonLabel[complaint.reason] || complaint.reason}
                    </td>
                    <td className="max-w-xs px-4 py-4 text-slate-500">
                      <p className="line-clamp-3">{complaint.description || "No details provided"}</p>
                      {complaint.admin_note && (
                        <p className="mt-2 rounded-lg bg-slate-50 p-2 text-xs font-semibold text-slate-600">
                          Admin: {complaint.admin_note}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${complaintStatusColor[complaint.status] || "bg-slate-100 text-slate-700"}`}>
                        {complaint.status}
                      </span>
                      <p className="mt-2 text-xs text-slate-400">{new Date(complaint.created_at).toLocaleString()}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleComplaintUpdate(complaint.id, { status: "reviewing" })} className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100">
                          Review
                        </button>
                        <button onClick={() => handleComplaintUpdate(complaint.id, { status: "resolved", action: "hide_listing", admin_note: "Listing hidden after complaint review." })} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100">
                          Hide Listing
                        </button>
                        <button onClick={() => handleComplaintUpdate(complaint.id, { status: "resolved", action: "restore_listing", admin_note: "Listing restored after review." })} className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100">
                          Restore
                        </button>
                        <button onClick={() => handleComplaintUpdate(complaint.id, { status: "rejected", admin_note: "Complaint dismissed by admin." })} className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200">
                          Dismiss
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("Deactivate the poster of this listing?")) {
                              handleComplaintUpdate(complaint.id, {
                                status: "resolved",
                                action: "deactivate_poster",
                                admin_note: "Poster deactivated after complaint review.",
                              });
                            }
                          }}
                          className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100"
                        >
                          Deactivate Poster
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredComplaints.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center text-slate-400">
                      No complaints match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;
