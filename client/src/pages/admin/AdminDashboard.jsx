import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";


const AdminDashboard = () => {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/listings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/claims", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClaims(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setAnalyticsError("");
    try {
      const res = await axios.get("/api/admin/analytics", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAnalytics(res.data);
    } catch (error) {
      console.error(error);
      setAnalytics(null);
      setAnalyticsError(error.response?.data?.message || "Could not load platform analytics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchAuditLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/admin/audit-logs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuditLogs(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

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
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeTab === "users") fetchUsers();
    if (activeTab === "listings") fetchListings();
    if (activeTab === "claims") fetchClaims();
    if (activeTab === "transactions") fetchTransactions();
    if (activeTab === "audit") fetchAuditLogs();
    if (activeTab === "complaints") fetchComplaints();
    if (activeTab === "analytics") fetchAnalytics();
  }, [activeTab, fetchUsers, fetchListings, fetchClaims, fetchTransactions, fetchAuditLogs, fetchComplaints, fetchAnalytics]);

  const handleToggleUser = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${id}/toggle`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteUser = async (user) => {
    const name = user.organization_name || user.full_name || user.email;
    if (!window.confirm(`Delete ${name}? This will also remove related listings, claims, transactions, and notifications.`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete user");
    }
  };

  const handleVerifyUser = async (id, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/admin/users/${id}/verification`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update verification");
    }
  };

  const handleDeleteListing = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchListings();
    } catch (error) {
      console.error(error);
    }
  };

  const handleComplaintUpdate = async (id, payload) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/complaints/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchComplaints();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update complaint");
    }
  };

  const downloadPlatformReport = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/reports/platform", {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "text/csv" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "platform-report.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error.response?.data?.message || "Could not download report");
    }
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "users", label: "Users" },
    { key: "claims", label: "Claims" },
    { key: "transactions", label: "Transactions" },
    { key: "audit", label: "Audit Logs" },
    { key: "analytics", label: "Analytics" },
  ];

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

  const analyticsTotals = analytics?.totals || {};
  const analyticsMonthly = analytics?.monthly || [];
  const analyticsTopDonors = analytics?.topDonors || [];
  const analyticsTopCharities = analytics?.topCharities || [];

  const safetyColor = {
    safe: "bg-green-100 text-green-700",
    moderate_risk: "bg-yellow-100 text-yellow-700",
    unsafe: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-4 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "analytics" && loading && <div className="py-20 text-center text-gray-400">Loading analytics...</div>}
        {activeTab === "analytics" && !loading && analyticsError && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {analyticsError}
          </div>
        )}
        {activeTab === "analytics" && analytics && (
          <section className="space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold">Platform Analytics</h2>
                <p className="text-sm text-gray-500">Platform-wide redistribution and matching performance.</p>
              </div>
              <button
                type="button"
                onClick={downloadPlatformReport}
                className="rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-600"
              >
                Download CSV
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
              {[
                ["Sold", analyticsTotals.sold || 0],
                ["Donated", analyticsTotals.donated || 0],
                ["Wasted", analyticsTotals.wasted || 0],
                ["Recovered", `Rs ${analyticsTotals.recovered_value || 0}`],
                ["Avg safety", `${analytics.averageSafetyScore || 0}/100`],
                ["Avg match", `${analytics.averageMatchScore || 0}%`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border bg-white p-4">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="mt-1 text-xl font-bold">{value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border bg-white p-5">
              <h3 className="font-bold">Monthly trend</h3>
              <div className="mt-4 grid gap-2">
                {analyticsMonthly.map((month) => (
                  <div key={month.month} className="grid grid-cols-4 rounded-lg bg-gray-50 p-3 text-sm">
                    <b>{month.month}</b><span>Sold {month.sold}</span><span>Donated {month.donated}</span><span>Wasted {month.wasted}</span>
                  </div>
                ))}
                {analyticsMonthly.length === 0 && <p className="py-8 text-center text-sm text-gray-400">No monthly analytics yet.</p>}
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              {[["Top Donors", analyticsTopDonors, "listings"], ["Top Charities", analyticsTopCharities, "claims"]].map(([title, rows, metric]) => (
                <div key={title} className="rounded-xl border bg-white p-5">
                  <h3 className="font-bold">{title}</h3>
                  <table className="mt-3 w-full text-sm"><tbody>
                    {rows.map((row) => <tr key={row.id} className="border-t"><td className="py-3">{row.name}</td><td className="text-right font-bold">{row[metric]}</td></tr>)}
                    {rows.length === 0 && <tr><td className="py-8 text-center text-gray-400" colSpan={2}>No records yet.</td></tr>}
                  </tbody></table>
                </div>
              ))}
            </div>
          </section>
        )}
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && loading && (
          <div className="text-center text-gray-400 py-20">Loading...</div>
        )}

        {activeTab === "overview" && stats && (
          <div className="space-y-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Platform Overview
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Real-time statistics across the platform
              </p>
            </div>

            {/* User Stats */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Users
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Total Users",
                    value: stats.users.total,
                    color: "text-gray-900",
                  },
                  {
                    label: "Donors",
                    value: stats.users.donors,
                    color: "text-green-600",
                  },
                  {
                    label: "Charities",
                    value: stats.users.charities,
                    color: "text-blue-600",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                  >
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Listing Stats */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Listings
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  {
                    label: "Total",
                    value: stats.listings.total,
                    color: "text-gray-900",
                  },
                  {
                    label: "Available",
                    value: stats.listings.available,
                    color: "text-green-600",
                  },
                  {
                    label: "Claimed",
                    value: stats.listings.claimed,
                    color: "text-blue-600",
                  },
                  {
                    label: "Collected",
                    value: stats.listings.collected,
                    color: "text-gray-500",
                  },
                  {
                    label: "Expired",
                    value: stats.listings.expired,
                    color: "text-red-500",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
                  >
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Safety Score Breakdown */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Food Safety Scores
              </h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  {
                    label: "Safe",
                    value: stats.safety.safe,
                    color: "text-green-600",
                    bg: "bg-green-50 border-green-100",
                  },
                  {
                    label: "Moderate Risk",
                    value: stats.safety.moderate,
                    color: "text-yellow-600",
                    bg: "bg-yellow-50 border-yellow-100",
                  },
                  {
                    label: "Unsafe",
                    value: stats.safety.unsafe,
                    color: "text-red-600",
                    bg: "bg-red-50 border-red-100",
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`rounded-2xl border p-5 ${s.bg}`}
                  >
                    <p className="text-sm text-gray-500">{s.label}</p>
                    <p className={`text-3xl font-bold mt-1 ${s.color}`}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Claims */}
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Claims
              </h2>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm inline-block">
                <p className="text-sm text-gray-500">Total Claims</p>
                <p className="text-3xl font-bold mt-1 text-gray-900">
                  {stats.claims.total}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">All Users</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      "Name",
                      "Email",
                      "Role",
                      "Organization",
                      "City",
                      "Verification",
                      "Status",
                      "Actions",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {u.full_name}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{u.email}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.role === "donor"
                              ? "bg-green-100 text-green-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {u.organization_name || "—"}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {u.city || "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.verification_status === "verified"
                              ? "bg-green-100 text-green-700"
                              : u.verification_status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {u.verification_status || "pending"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            u.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleToggleUser(u.id)}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition ${
                            u.is_active
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-green-50 text-green-600 hover:bg-green-100"
                          }`}
                        >
                          {u.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => handleVerifyUser(u.id, "verified")}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
                        >
                          Verify
                        </button>
                        <button
                          onClick={() => handleVerifyUser(u.id, "rejected")}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition"
                        >
                          Reject
                        </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LISTINGS TAB */}
        {activeTab === "listings" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              All Listings
            </h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      "Title",
                      "Donor",
                      "City",
                      "Quantity",
                      "Status",
                      "Safety",
                      "Expires",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {listings.map((l) => (
                    <tr key={l.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-4 font-medium text-gray-900">
                        {l.title}
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        {l.organization_name || l.donor_name}
                      </td>
                      <td className="px-4 py-4 text-gray-500">{l.city}</td>
                      <td className="px-4 py-4 text-gray-500">{l.quantity}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[l.status]}`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${safetyColor[l.safety_score]}`}
                        >
                          {l.safety_score?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-xs">
                        {new Date(l.expires_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleDeleteListing(l.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CLAIMS TAB */}
        {activeTab === "claims" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">All Claims</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {[
                      "Food Item",
                      "Donor",
                      "Charity",
                      "City",
                      "Status",
                      "Claimed At",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claims.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-900">
                        {c.title}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {c.donor_org || c.donor_name}
                      </td>
                      <td className="px-5 py-4 text-gray-500">
                        {c.charity_org || c.charity_name}
                      </td>
                      <td className="px-5 py-4 text-gray-500">{c.city}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            c.status === "collected"
                              ? "bg-green-100 text-green-700"
                              : c.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : c.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-gray-500 text-xs">
                        {new Date(c.claimed_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "complaints" && (
          <div>
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Complaints & Fake Listings</h2>
                <p className="text-sm text-gray-500">Review reports, hide suspicious listings, and resolve complaints.</p>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                {["pending", "reviewing", "resolved", "rejected"].map((status) => (
                  <div key={status} className="rounded-lg border bg-white px-3 py-2">
                    <p className="font-bold capitalize text-gray-700">{status}</p>
                    <p className="text-lg font-black">{complaints.filter((item) => item.status === status).length}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Listing", "Reporter", "Reason", "Details", "Status", "Actions"].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="align-top hover:bg-gray-50 transition">
                      <td className="px-4 py-4">
                        <p className="font-bold text-gray-900">{complaint.title}</p>
                        <p className="mt-1 text-xs text-gray-500">
                          #{complaint.listing_id} · {complaint.city || "No city"} · {complaint.food_category || "No category"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Poster: {complaint.donor_org || complaint.donor_name}
                        </p>
                        <span className={`mt-2 inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor[complaint.listing_status] || "bg-gray-100 text-gray-700"}`}>
                          {complaint.listing_status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500">
                        <p>{complaint.reporter_name || "Deleted user"}</p>
                        <p className="text-xs">{complaint.reporter_email}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-gray-900">
                        {complaintReasonLabel[complaint.reason] || complaint.reason}
                      </td>
                      <td className="max-w-xs px-4 py-4 text-gray-500">
                        <p className="line-clamp-3">{complaint.description || "No details provided"}</p>
                        {complaint.admin_note && (
                          <p className="mt-2 rounded-lg bg-gray-50 p-2 text-xs font-semibold text-gray-600">
                            Admin: {complaint.admin_note}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${complaintStatusColor[complaint.status]}`}>
                          {complaint.status}
                        </span>
                        <p className="mt-2 text-xs text-gray-400">{new Date(complaint.created_at).toLocaleString()}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleComplaintUpdate(complaint.id, { status: "reviewing" })}
                            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100"
                          >
                            Review
                          </button>
                          <button
                            onClick={() => handleComplaintUpdate(complaint.id, { status: "resolved", action: "hide_listing", admin_note: "Listing hidden after complaint review." })}
                            className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 hover:bg-amber-100"
                          >
                            Hide Listing
                          </button>
                          <button
                            onClick={() => handleComplaintUpdate(complaint.id, { status: "resolved", action: "restore_listing", admin_note: "Listing restored after review." })}
                            className="rounded-lg bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 hover:bg-green-100"
                          >
                            Restore
                          </button>
                          <button
                            onClick={() => handleComplaintUpdate(complaint.id, { status: "rejected", admin_note: "Complaint dismissed by admin." })}
                            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-200"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm("Deactivate the poster of this listing?")) {
                                handleComplaintUpdate(complaint.id, { status: "resolved", action: "deactivate_poster", admin_note: "Poster deactivated after complaint review." });
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
                  {complaints.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-gray-400">
                        No complaints submitted yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Transactions</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Food Item", "Seller", "Buyer", "Amount", "Status", "Created"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-900">{t.title}</td>
                      <td className="px-5 py-4 text-gray-500">{t.seller_org || t.seller_name}</td>
                      <td className="px-5 py-4 text-gray-500">{t.buyer_org || t.buyer_name}</td>
                      <td className="px-5 py-4 font-bold text-gray-900">Rs {Number(t.total_amount || 0).toFixed(2)}</td>
                      <td className="px-5 py-4 text-gray-500">{t.status}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{new Date(t.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "audit" && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Audit Logs</h2>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    {["Action", "Actor", "Entity", "Details", "Time"].map((h) => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-4 font-medium text-gray-900">{log.action}</td>
                      <td className="px-5 py-4 text-gray-500">{log.actor_email || log.actor_name || "System"}</td>
                      <td className="px-5 py-4 text-gray-500">{log.entity_type} #{log.entity_id}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{JSON.stringify(log.details || {})}</td>
                      <td className="px-5 py-4 text-gray-500 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
