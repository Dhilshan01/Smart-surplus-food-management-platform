import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const categories = [
  "Cooked Meal",
  "Bakery",
  "Fruits & Vegetables",
  "Dairy",
  "Beverages",
  "Packaged Food",
  "Other",
];

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const statusClass = {
  pending: "border-amber-200 bg-amber-50 text-amber-700",
  approved: "border-emerald-200 bg-emerald-50 text-emerald-700",
  rejected: "border-red-200 bg-red-50 text-red-700",
  fulfilled: "border-blue-200 bg-blue-50 text-blue-700",
};

const DonationRequests = () => {
  const { token } = useAuth();
  const [donors, setDonors] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDonor, setActiveDonor] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    food_category: "Cooked Meal",
    quantity: "",
    needed_by: "",
    city: "",
    message: "",
  });

  const authConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const donorsRes = await axios.get("/api/donor-requests/donors", authConfig);
      setDonors(donorsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load donors.");
    } finally {
      setLoading(false);
    }

    try {
      const requestsRes = await axios.get("/api/donor-requests/mine", authConfig);
      setRequests(requestsRes.data);
    } catch (err) {
      console.error(err);
      setRequests([]);
    }
  }, [authConfig]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const cities = useMemo(
    () => [...new Set(donors.map((donor) => donor.city).filter(Boolean))],
    [donors],
  );

  const filteredDonors = donors.filter((donor) => {
    const name = `${donor.organization_name || ""} ${donor.full_name || ""}`.toLowerCase();
    return (
      (!search || name.includes(search.toLowerCase())) &&
      (!cityFilter || donor.city === cityFilter)
    );
  });

  const openRequest = (donor) => {
    setActiveDonor(donor);
    setForm({
      food_category: "Cooked Meal",
      quantity: "",
      needed_by: "",
      city: donor.city || "",
      message: "",
    });
    setError("");
  };

  const submitRequest = async (e) => {
    e.preventDefault();
    if (!activeDonor) return;

    setSubmitting(true);
    setError("");
    try {
      await axios.post(
        "/api/donor-requests",
        { donor_id: activeDonor.id, ...form },
        authConfig,
      );
      setActiveDonor(null);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Could not send food request.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Donor requests</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950">Request Food From Donors</h1>
          <p className="mt-1 text-sm text-slate-500">Choose a registered donor and send a food request directly.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search donor..."
            className={inputClass}
          />
          <select value={cityFilter} onChange={(e) => setCityFilter(e.target.value)} className={inputClass}>
            <option value="">All cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {loading ? (
            <div className="rounded-lg border border-slate-200 bg-white py-20 text-center text-sm font-semibold text-slate-500">
              Loading donors...
            </div>
          ) : filteredDonors.length === 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-sm">
              <p className="font-black text-slate-950">No donors found</p>
              <p className="mt-1 text-sm text-slate-500">Try changing your filters.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredDonors.map((donor) => (
                <article key={donor.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-black text-slate-950">
                        {donor.organization_name || donor.full_name}
                      </h2>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{donor.business_type || "Food donor"}</p>
                    </div>
                    <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                      Registered
                    </span>
                  </div>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <dt className="text-xs font-semibold text-slate-500">City</dt>
                      <dd className="mt-1 font-black text-slate-950">{donor.city || "Not set"}</dd>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <dt className="text-xs font-semibold text-slate-500">Available listings</dt>
                      <dd className="mt-1 font-black text-slate-950">{donor.available_listings || 0}</dd>
                    </div>
                  </dl>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-500">{donor.address || donor.phone || "Contact details available after request approval."}</p>
                  <button
                    type="button"
                    onClick={() => openRequest(donor)}
                    className="mt-4 w-full rounded-lg bg-emerald-600 px-3 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700"
                  >
                    Send food request
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-black text-slate-950">My Sent Requests</h2>
          <div className="mt-4 space-y-3">
            {requests.length === 0 ? (
              <p className="py-10 text-center text-sm font-semibold text-slate-400">No donor requests yet</p>
            ) : (
              requests.map((request) => (
                <article key={request.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-black text-slate-950">{request.donor_org || request.donor_name}</h3>
                      <p className="mt-1 text-xs font-semibold text-slate-500">{request.quantity} / {request.food_category || "Any food"}</p>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2 py-1 text-xs font-black ${statusClass[request.status] || statusClass.pending}`}>
                      {request.status}
                    </span>
                  </div>
                  {request.message && <p className="mt-2 line-clamp-2 text-xs text-slate-500">{request.message}</p>}
                </article>
              ))
            )}
          </div>
        </aside>
      </div>

      {activeDonor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-sm">
          <form onSubmit={submitRequest} className="w-full max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Food request</p>
                <h2 className="mt-1 text-lg font-black text-slate-950">{activeDonor.organization_name || activeDonor.full_name}</h2>
                <p className="mt-1 text-sm text-slate-500">{activeDonor.city || "City not set"}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDonor(null)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Food category</label>
                <select value={form.food_category} onChange={(e) => setForm({ ...form, food_category: e.target.value })} className={inputClass}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Quantity needed</label>
                <input
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  placeholder="50 meal packs"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Needed by</label>
                <input
                  type="datetime-local"
                  value={form.needed_by}
                  onChange={(e) => setForm({ ...form, needed_by: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Message to donor</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  placeholder="Explain why you need the donation and how collection will happen."
                  className={`${inputClass} resize-none`}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send request"}
            </button>
          </form>
        </div>
      )}
    </section>
  );
};

export default DonationRequests;
