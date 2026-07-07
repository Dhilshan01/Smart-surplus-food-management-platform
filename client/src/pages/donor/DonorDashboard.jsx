import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ListingCard from "../../components/ListingCard";
import AnalyticsDashboard from "./AnalyticsDashboard";

const currency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const tabs = [
  { key: "my-listings", label: "Listings" },
  { key: "analytics", label: "Analytics" },
  { key: "my-purchases", label: "Purchases" },
  { key: "my-sales", label: "Sales" },
  { key: "requests", label: "Requests" },
];

const statusColor = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  collected: "bg-blue-50 text-blue-700 border-blue-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const DonorDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [mainTab, setMainTab] = useState("my-listings");
  const [listings, setListings] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [sales, setSales] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const fetchListings = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/listings/my-listings", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setListings(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchPurchases = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transactions/my-purchases", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPurchases(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const fetchSales = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/transactions/my-sales", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSales(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  const fetchRequests = useCallback(async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/claims/received", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRequests(res.data);
    } catch (error) {
      console.error(error);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchListings();
  }, [fetchListings]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (mainTab === "my-purchases") fetchPurchases();
    if (mainTab === "my-sales") fetchSales();
    if (mainTab === "requests") fetchRequests();
  }, [fetchPurchases, fetchSales, fetchRequests, mainTab]);

  const stats = useMemo(() => {
    const available = listings.filter((listing) => listing.status === "available").length;
    const claimed = listings.filter((listing) => listing.status === "claimed").length;
    const collected = listings.filter((listing) => listing.status === "collected").length;
    const expired = listings.filter((listing) => listing.status === "expired").length;
    const saleValue = listings
      .filter((listing) => listing.listing_type === "sale")
      .reduce((sum, listing) => sum + Number(listing.unit_price || 0), 0);

    return {
      total: listings.length,
      available,
      claimed,
      collected,
      expired,
      saleValue,
    };
  }, [listings]);

  const filters = [
    { key: "all", label: "All", count: stats.total },
    { key: "available", label: "Available", count: stats.available },
    { key: "claimed", label: "Claimed", count: stats.claimed },
    { key: "collected", label: "Collected", count: stats.collected },
    { key: "expired", label: "Expired", count: stats.expired },
  ];

  const filteredListings =
    activeFilter === "all" ? listings : listings.filter((listing) => listing.status === activeFilter);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/listings/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchListings();
    } catch (error) {
      console.error(error);
    }
  };

  const handleCollectPurchase = async (transactionId) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/transactions/${transactionId}/collect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchPurchases();
      fetchListings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to mark as collected");
    }
  };

  const handleRequestDecision = async (claimId, status) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/claims/${claimId}/decision`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      fetchRequests();
      fetchListings();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update request");
    }
  };

  const renderTransactionList = (items, type) => {
    const isPurchase = type === "purchase";
    return (
      <div className="space-y-3">
        {items.map((item) => (
          <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="truncate text-base font-black text-slate-950">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {isPurchase ? "Supplier" : "Buyer"}:{" "}
                  <span className="font-semibold text-slate-700">
                    {isPurchase ? item.seller_org : item.buyer_org}
                  </span>{" "}
                  / {item.city}
                </p>
                <p className="mt-2 text-xs font-semibold text-slate-400">
                  {isPurchase ? "Purchased" : "Sold"} on {new Date(item.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <p className={`text-2xl font-black ${isPurchase ? "text-slate-950" : "text-emerald-700"}`}>
                  {isPurchase ? "" : "+"}
                  {currency(item.total_amount)}
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${
                    statusColor[item.status] || "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {item.status}
                </span>
                {isPurchase && item.status !== "collected" && (
                  <button
                    type="button"
                    onClick={() => handleCollectPurchase(item.id)}
                    className="mt-3 block rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white transition hover:bg-blue-700 sm:ml-auto"
                  >
                    Mark collected
                  </button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Operations workspace</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            {user?.organization_name || user?.full_name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage surplus listings, donation requests, purchase history, and redistribution impact.
          </p>
        </div>
        <Link
          to="/donor/create-listing"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
        >
          Create listing
        </Link>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        {[
          { label: "Total listed", value: stats.total, tone: "text-slate-950" },
          { label: "Available", value: stats.available, tone: "text-emerald-700" },
          { label: "In progress", value: stats.claimed, tone: "text-blue-700" },
          { label: "Expired", value: stats.expired, tone: "text-red-600" },
          { label: "Active sale value", value: currency(stats.saleValue), tone: "text-slate-950" },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">{item.label}</p>
            <p className={`mt-1 text-2xl font-black ${item.tone}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setMainTab(tab.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-black transition ${
              mainTab === tab.key
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-950"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {mainTab === "my-listings" && (
        <section>
          <div className="mb-5 flex flex-wrap gap-2">
            {filters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-lg border px-3 py-2 text-sm font-bold transition ${
                  activeFilter === filter.key
                    ? "border-slate-950 bg-slate-950 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                {filter.label} <span className="ml-1 opacity-70">{filter.count}</span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white py-20 text-center text-sm font-semibold text-slate-500">
              Loading listings...
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-sm">
              <p className="text-base font-black text-slate-950">No listings found</p>
              <p className="mt-1 text-sm text-slate-500">Create your first surplus listing to start tracking outcomes.</p>
              <Link
                to="/donor/create-listing"
                className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700"
              >
                Create listing
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  showActions
                  onEdit={() => navigate(`/donor/edit-listing/${listing.id}`)}
                  onDelete={listing.status === "available" ? handleDelete : null}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {mainTab === "analytics" && <AnalyticsDashboard />}

      {mainTab === "my-purchases" && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-950">Purchase history</h2>
            <p className="mt-1 text-sm text-slate-500">Track marketplace stock you have reserved or collected.</p>
          </div>
          {purchases.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-sm">
              <p className="text-base font-black text-slate-950">No purchases yet</p>
              <Link
                to="/donor/marketplace"
                className="mt-5 inline-flex rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700"
              >
                Browse marketplace
              </Link>
            </div>
          ) : (
            renderTransactionList(purchases, "purchase")
          )}
        </section>
      )}

      {mainTab === "my-sales" && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-950">Sales history</h2>
            <p className="mt-1 text-sm text-slate-500">Monitor B2B surplus revenue and collection status.</p>
          </div>
          {sales.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-sm">
              <p className="text-base font-black text-slate-950">No sales yet</p>
              <Link
                to="/donor/create-listing"
                className="mt-5 inline-flex rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white hover:bg-emerald-700"
              >
                Create sale listing
              </Link>
            </div>
          ) : (
            renderTransactionList(sales, "sale")
          )}
        </section>
      )}

      {mainTab === "requests" && (
        <section>
          <div className="mb-4">
            <h2 className="text-lg font-black text-slate-950">Donation requests</h2>
            <p className="mt-1 text-sm text-slate-500">Approve or reject charity requests for your donation listings.</p>
          </div>
          {requests.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white py-20 text-center text-sm font-semibold text-slate-500">
              No donation requests yet
            </div>
          ) : (
            <div className="space-y-3">
              {requests.map((request) => (
                <article key={request.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-black text-slate-950">{request.title}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {request.charity_org || request.charity_name} requested {request.quantity} in {request.city}
                      </p>
                      {request.notes && <p className="mt-2 text-sm text-slate-600">{request.notes}</p>}
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-black capitalize text-slate-700">
                        {request.status}
                      </span>
                      {request.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleRequestDecision(request.id, "approved")}
                            className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white hover:bg-emerald-700"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRequestDecision(request.id, "rejected")}
                            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-black text-red-700 hover:bg-red-100"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default DonorDashboard;
