import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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

const storageLabels = {
  room_temperature: "Room temperature",
  refrigerated: "Refrigerated",
  frozen: "Frozen",
};

const stateLabels = {
  active: "Active",
  low_stock: "Low stock",
  expiring_soon: "Expiring soon",
  expired: "Expired",
  out_of_stock: "Out of stock",
  archived: "Archived",
};

const stateClass = {
  active: "border-emerald-200 bg-emerald-50 text-emerald-700",
  low_stock: "border-amber-200 bg-amber-50 text-amber-700",
  expiring_soon: "border-orange-200 bg-orange-50 text-orange-700",
  expired: "border-red-200 bg-red-50 text-red-700",
  out_of_stock: "border-slate-200 bg-slate-50 text-slate-600",
  archived: "border-slate-200 bg-slate-50 text-slate-600",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const emptyInventoryForm = {
  name: "",
  description: "",
  category: "Bakery",
  quantity: "",
  unit: "items",
  unit_price: "",
  expiry_date: "",
  storage_conditions: "room_temperature",
  low_stock_threshold: "5",
  image_url: "",
};

const formatNumber = (value) => Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 2 });
const currency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

const InventoryPanel = ({ showStockForm = false, onCloseStockForm }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [form, setForm] = useState(emptyInventoryForm);
  const [editingId, setEditingId] = useState(null);

  const authConfig = useMemo(() => ({ headers: { Authorization: `Bearer ${token}` } }), [token]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/inventory", authConfig);
      setItems(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load inventory.");
    } finally {
      setLoading(false);
    }
  }, [authConfig]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory();
  }, [fetchInventory]);

  const stats = useMemo(
    () => ({
      total: items.length,
      active: items.filter((item) => item.inventory_state === "active").length,
      low: items.filter((item) => item.inventory_state === "low_stock").length,
      expiring: items.filter((item) => item.inventory_state === "expiring_soon" || item.inventory_state === "expired").length,
      value: items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unit_price || 0), 0),
    }),
    [items],
  );

  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesTerm =
        !term ||
        item.name?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term) ||
        item.unit?.toLowerCase().includes(term);
      const matchesState = stateFilter === "all" || item.inventory_state === stateFilter;
      return matchesTerm && matchesState;
    });
  }, [items, query, stateFilter]);

  const formOpen = showStockForm || Boolean(editingId);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose a valid image file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      setError("Inventory image must be under 3 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((current) => ({ ...current, image_url: reader.result }));
      setError("");
    };
    reader.onerror = () => setError("Could not read the selected image.");
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyInventoryForm);
    onCloseStockForm?.();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/inventory/${editingId}`, form, authConfig);
      } else {
        await axios.post("http://localhost:5000/api/inventory", form, authConfig);
      }
      resetForm();
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save inventory item.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this inventory item?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/inventory/${id}`, authConfig);
      fetchInventory();
    } catch (err) {
      setError(err.response?.data?.message || "Could not remove inventory item.");
    }
  };

  return (
    <section className={`grid gap-6 ${formOpen ? "xl:grid-cols-[380px_minmax(0,1fr)]" : ""}`}>
      {formOpen && (
      <div className="space-y-5">
        <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-black text-slate-950">{editingId ? "Edit stock item" : "Add stock item"}</h2>
              <p className="mt-1 text-sm text-slate-500">Keep shop goods ready for donation or resale.</p>
            </div>
            {(editingId || showStockForm) && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Product name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Bread loaves"
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                placeholder="Batch, packaging, allergen notes..."
                className={`${inputClass} resize-none`}
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Storage</label>
                <select
                  value={form.storage_conditions}
                  onChange={(e) => setForm({ ...form, storage_conditions: e.target.value })}
                  className={inputClass}
                >
                  <option value="room_temperature">Room temperature</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="frozen">Frozen</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Unit</label>
                <input
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  placeholder="packs"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Unit price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.unit_price}
                  onChange={(e) => setForm({ ...form, unit_price: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Low stock at</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.low_stock_threshold}
                  onChange={(e) => setForm({ ...form, low_stock_threshold: e.target.value })}
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Expiry date</label>
              <input
                type="datetime-local"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Product photo</label>
              <div className="grid gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
                {form.image_url && (
                  <img src={form.image_url} alt="Inventory preview" className="aspect-[4/3] w-full rounded-lg object-cover" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-emerald-700"
                />
                {form.image_url && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image_url: "" })}
                    className="justify-self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? "Saving..." : editingId ? "Save item" : "Add to inventory"}
            </button>
          </div>
        </form>
      </div>
      )}

      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Stock items", value: stats.total, tone: "text-slate-950" },
            { label: "Healthy stock", value: stats.active, tone: "text-emerald-700" },
            { label: "Low stock", value: stats.low, tone: "text-amber-700" },
            { label: "Inventory value", value: currency(stats.value), tone: "text-slate-950" },
          ].map((stat) => (
            <div key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500">{stat.label}</p>
              <p className={`mt-1 text-2xl font-black ${stat.tone}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search inventory..."
              className={inputClass}
            />
            <select value={stateFilter} onChange={(e) => setStateFilter(e.target.value)} className={inputClass}>
              <option value="all">All stock</option>
              <option value="active">Active</option>
              <option value="low_stock">Low stock</option>
              <option value="expiring_soon">Expiring soon</option>
              <option value="expired">Expired</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white py-20 text-center text-sm font-semibold text-slate-500">
            Loading inventory...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white py-20 text-center shadow-sm">
            <p className="text-base font-black text-slate-950">No inventory items found</p>
            <p className="mt-1 text-sm text-slate-500">Add shop stock to start publishing listings faster.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <article
                key={item.id}
                className="flex aspect-square min-h-[340px] flex-col rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto_auto] gap-3">
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full min-h-[120px] items-center justify-center px-3 text-center text-sm font-semibold text-slate-400">
                        No photo
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex min-h-12 items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="line-clamp-1 text-base font-black text-slate-950">{item.name}</h3>
                        <p className="mt-1 line-clamp-1 text-xs font-semibold text-slate-500">{item.category || "Uncategorized"}</p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${
                          stateClass[item.inventory_state] || stateClass.active
                        }`}
                      >
                        {stateLabels[item.inventory_state] || item.inventory_state}
                      </span>
                    </div>

                    <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="min-w-0 rounded-lg bg-slate-50 p-3">
                        <dt className="text-xs font-semibold text-slate-500">Stock</dt>
                        <dd className="mt-1 truncate font-black text-slate-950">
                          {formatNumber(item.quantity)} {item.unit}
                        </dd>
                      </div>
                      <div className="min-w-0 rounded-lg bg-slate-50 p-3">
                        <dt className="text-xs font-semibold text-slate-500">Value</dt>
                        <dd className="mt-1 truncate font-black text-slate-950">{currency(Number(item.quantity || 0) * Number(item.unit_price || 0))}</dd>
                      </div>
                    </dl>

                    <div className="mt-3 min-h-8 text-xs font-semibold leading-4 text-slate-500">
                      <p className="line-clamp-1">{storageLabels[item.storage_conditions] || item.storage_conditions}</p>
                      {item.expiry_date && <p className="line-clamp-1">Expires {new Date(item.expiry_date).toLocaleString()}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Link
                      to={`/donor/create-listing?inventoryId=${item.id}`}
                      aria-disabled={Number(item.quantity) <= 0 || item.inventory_state === "expired"}
                      className={`flex min-w-0 items-center justify-center rounded-lg px-2 py-2 text-center text-xs font-black text-white transition ${
                        Number(item.quantity) <= 0 || item.inventory_state === "expired"
                          ? "pointer-events-none bg-slate-300"
                          : "bg-slate-950 hover:bg-emerald-700"
                      }`}
                    >
                      Create
                    </Link>
                    <Link
                      to={`/donor/inventory/edit/${item.id}`}
                      className="flex min-w-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-2 py-2 text-center text-xs font-black text-slate-600 transition hover:bg-slate-50"
                    >
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="min-w-0 rounded-lg border border-red-200 bg-red-50 px-2 py-2 text-xs font-black text-red-700 transition hover:bg-red-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default InventoryPanel;
