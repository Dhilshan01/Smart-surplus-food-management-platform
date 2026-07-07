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

const safetyColor = {
  safe: "bg-green-100 text-green-700",
  moderate_risk: "bg-yellow-100 text-yellow-700",
  unsafe: "bg-red-100 text-red-700",
};

const AdminListings = () => {
  const { token } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [search, setSearch] = useState("");

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings();
  }, [fetchListings]);

  const filteredListings = useMemo(() => {
    const query = search.trim().toLowerCase();
    return listings.filter((listing) => {
      const haystack = [
        listing.title,
        listing.city,
        listing.quantity,
        listing.food_category,
        listing.organization_name,
        listing.donor_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        (!statusFilter || listing.status === statusFilter) &&
        (!typeFilter || listing.listing_type === typeFilter) &&
        (!query || haystack.includes(query))
      );
    });
  }, [listings, search, statusFilter, typeFilter]);

  const counts = useMemo(
    () => ({
      total: listings.length,
      available: listings.filter((listing) => listing.status === "available").length,
      flagged: listings.filter((listing) => listing.status === "flagged").length,
      donation: listings.filter((listing) => listing.listing_type === "donation").length,
      sale: listings.filter((listing) => listing.listing_type === "sale").length,
    }),
    [listings],
  );

  const handleDeleteListing = async (listing) => {
    if (!window.confirm(`Delete "${listing.title}"?`)) return;

    try {
      await axios.delete(`http://localhost:5000/api/admin/listings/${listing.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchListings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete listing");
    }
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Admin control</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">All Listings</h1>
          <p className="mt-1 text-sm text-slate-500">Review, filter, and manage every posted food listing.</p>
        </div>
        <button
          type="button"
          onClick={fetchListings}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Total", counts.total],
          ["Available", counts.available],
          ["Flagged", counts.flagged],
          ["Donations", counts.donation],
          ["Sales", counts.sale],
        ].map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_auto]">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search title, donor, city, category..."
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">All statuses</option>
            <option value="available">Available</option>
            <option value="claimed">Claimed</option>
            <option value="collected">Collected</option>
            <option value="expired">Expired</option>
            <option value="flagged">Flagged</option>
          </select>
          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
          >
            <option value="">All types</option>
            <option value="donation">Donation</option>
            <option value="sale">Sale</option>
          </select>
          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-sm font-semibold text-slate-500">Loading listings...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  {["Food", "Donor", "Type", "Quantity", "Status", "Safety", "Expires", "Action"].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="transition hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-16 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                          {listing.image_url ? (
                            <img src={listing.image_url} alt={listing.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-xs font-bold text-slate-400">No img</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-black text-slate-950">{listing.title}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {listing.food_category || "No category"} · {listing.city || "No city"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{listing.organization_name || listing.donor_name || "Unknown"}</td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-700">
                        {listing.listing_type || "donation"}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-semibold text-slate-700">{listing.quantity}</td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusColor[listing.status] || "bg-slate-100 text-slate-700"}`}>
                        {listing.status}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${safetyColor[listing.safety_score] || "bg-slate-100 text-slate-700"}`}>
                        {listing.safety_score?.replace("_", " ") || "Pending"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-slate-500">
                      {new Date(listing.expires_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => handleDeleteListing(listing)}
                        className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredListings.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-slate-400">
                      No listings match your filters.
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

export default AdminListings;
