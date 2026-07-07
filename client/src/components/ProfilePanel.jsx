import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const ProfilePanel = ({ compact = false }) => {
  const { user, token, login } = useAuth();
  const [formData, setFormData] = useState({
    full_name: "",
    organization_name: "",
    phone: "",
    address: "",
    city: "",
    registration_number: "",
    business_type: "",
    service_area: "",
    charity_type: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const profile = user?.role === "donor" ? user?.business_profile : user?.charity_profile;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormData({
      full_name: user?.full_name || "",
      organization_name: user?.organization_name || "",
      phone: user?.phone || "",
      address: user?.address || "",
      city: user?.city || "",
      registration_number: profile?.registration_number || "",
      business_type: profile?.business_type || "",
      service_area: profile?.service_area || "",
      charity_type: profile?.charity_type || "",
    });
  }, [user]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const res = await axios.patch("http://localhost:5000/api/auth/me", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      login(token, res.data.user);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={compact ? "bg-white" : "mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm"}>
      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-950">Profile</h2>
        <p className="mt-1 text-sm text-slate-500">
          Verification status: <span className="font-bold capitalize">{user?.verification_status || "pending"}</span>
        </p>
      </div>

      {message && <p className="mb-4 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{message}</p>}
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p>}

      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">Full name</label>
          <input name="full_name" value={formData.full_name} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">Organization</label>
          <input name="organization_name" value={formData.organization_name} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">Phone</label>
          <input name="phone" value={formData.phone} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">City</label>
          <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-xs font-bold text-slate-600">Address</label>
          <input name="address" value={formData.address} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold text-slate-600">Registration number</label>
          <input name="registration_number" value={formData.registration_number} onChange={handleChange} className={inputClass} />
        </div>

        {user?.role === "donor" ? (
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-600">Business type</label>
            <input name="business_type" value={formData.business_type} onChange={handleChange} className={inputClass} />
          </div>
        ) : (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Charity type</label>
              <input name="charity_type" value={formData.charity_type} onChange={handleChange} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-xs font-bold text-slate-600">Service area</label>
              <input name="service_area" value={formData.service_area} onChange={handleChange} className={inputClass} />
            </div>
          </>
        )}

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save profile"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default ProfilePanel;
