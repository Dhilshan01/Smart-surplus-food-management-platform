import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
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

const toDateTimeLocal = (value) => {
  if (!value) return "";
  const date = new Date(value);
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return offsetDate.toISOString().slice(0, 16);
};

const AddStock = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
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
  });

  const loadInventoryItem = useCallback(async () => {
    if (!isEditing) return;
    setLoading(true);
    setError("");

    try {
      const res = await axios.get("http://localhost:5000/api/inventory", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const item = res.data.find((stockItem) => String(stockItem.id) === String(id));

      if (!item) {
        setError("Inventory item not found.");
        return;
      }

      setForm({
        name: item.name || "",
        description: item.description || "",
        category: item.category || "Other",
        quantity: item.quantity || "",
        unit: item.unit || "items",
        unit_price: item.unit_price || "",
        expiry_date: toDateTimeLocal(item.expiry_date),
        storage_conditions: item.storage_conditions || "room_temperature",
        low_stock_threshold: item.low_stock_threshold || "5",
        image_url: item.image_url || "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Could not load inventory item.");
    } finally {
      setLoading(false);
    }
  }, [id, isEditing, token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInventoryItem();
  }, [loadInventoryItem]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/inventory/${id}`, form, config);
      } else {
        await axios.post("http://localhost:5000/api/inventory", form, config);
      }
      navigate("/donor/inventory");
    } catch (err) {
      setError(err.response?.data?.message || "Could not save stock item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Inventory intake</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">{isEditing ? "Edit stock" : "Add stock"}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isEditing ? "Update this product or goods item in your shop inventory." : "Add a new product or goods item to your shop inventory."}
          </p>
        </div>
        <Link
          to="/donor/inventory"
          className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to inventory
        </Link>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4">
          {loading && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-500">
              Loading stock item...
            </div>
          )}
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

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="grid gap-4 sm:grid-cols-2">
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

          <div className="grid gap-4 sm:grid-cols-3">
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
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Expiry date</label>
              <input
                type="datetime-local"
                value={form.expiry_date}
                onChange={(e) => setForm({ ...form, expiry_date: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Product photo</label>
            <div className="grid gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 sm:grid-cols-[180px_minmax(0,1fr)]">
              <div className="aspect-[4/3] overflow-hidden rounded-lg border border-slate-200 bg-white">
                {form.image_url ? (
                  <img src={form.image_url} alt="Inventory preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center px-3 text-center text-xs font-semibold text-slate-400">
                    No photo selected
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center gap-3">
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
                    className="self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving || loading}
            className="rounded-lg bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Saving..." : isEditing ? "Save stock item" : "Add stock item"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddStock;
