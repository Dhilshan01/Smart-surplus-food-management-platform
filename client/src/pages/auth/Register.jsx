import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AuthFrame from "../../components/AuthFrame";

const Register = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "donor",
    organization_name: "",
    phone: "",
    address: "",
    city: "",
    registration_number: "",
    business_type: "",
    service_area: "",
    charity_type: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", formData);
      login(res.data.token, res.data.user);

      if (res.data.user.role === "donor") navigate("/donor/dashboard");
      else if (res.data.user.role === "charity") navigate("/charity/dashboard");
      else navigate("/admin/dashboard");

    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.request ? "Cannot reach the server. Check that the backend is running on port 5000." : "Registration failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      compact
      contentClassName="max-w-lg"
      eyebrow="Join the network"
      title="Create account"
      subtitle="Register your organization, then wait for admin verification before accessing platform tools."
      footer={(
        <p className="text-center text-sm text-[#748074]">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-emerald-700 hover:underline">
            Sign in
          </Link>
        </p>
      )}
    >
          {/* Role Selector */}
          <div className="mb-3 grid grid-cols-2 gap-2">
            {[
              { value: "donor", label: "Food Donor", icon: "", desc: "Restaurant, bakery, hotel" },
              { value: "charity", label: "Charity / NGO", icon: "", desc: "Community organization" },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setFormData({ ...formData, role: r.value })}
                className={`rounded-lg border px-3 py-2 text-left transition ${
                  formData.role === r.value
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-[#dfe4d7] bg-[#f9fbf6] hover:border-emerald-200"
                }`}
              >
                <span className="hidden">{r.icon}</span>
                <p className={`text-sm font-semibold ${
                  formData.role === r.value ? "text-green-700" : "text-gray-800"
                }`}>
                  {r.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-600">
              <span>!</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="max-h-[46vh] space-y-2.5 overflow-y-auto pr-2">
            {/* Full Name */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text" name="full_name"
                placeholder="Your full name"
                value={formData.full_name} onChange={handleChange} required
                className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email" name="email"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange} required
                className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Password */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password" name="password"
                placeholder="Min 6 characters"
                value={formData.password} onChange={handleChange} required
                className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Organization Name</label>
              <input
                type="text" name="organization_name"
                placeholder={formData.role === "donor" ? "e.g. Colombo Bakery" : "e.g. Hope Foundation"}
                value={formData.organization_name} onChange={handleChange} required
                className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {formData.role === "donor" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Registration Number</label>
                  <input
                    type="text" name="registration_number"
                    placeholder="Business reg. no."
                    value={formData.registration_number} onChange={handleChange} required
                    className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Business Type</label>
                  <select
                    name="business_type"
                    value={formData.business_type} onChange={handleChange}
                    className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select type</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="bakery">Bakery</option>
                    <option value="grocery">Grocery</option>
                    <option value="hotel">Hotel</option>
                    <option value="caterer">Caterer</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {formData.role === "charity" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Registration Number</label>
                  <input
                    type="text" name="registration_number"
                    placeholder="Charity reg. no."
                    value={formData.registration_number} onChange={handleChange} required
                    className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Charity Type</label>
                  <select
                    name="charity_type"
                    value={formData.charity_type} onChange={handleChange}
                    className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Select type</option>
                    <option value="ngo">NGO</option>
                    <option value="shelter">Shelter</option>
                    <option value="community_kitchen">Community Kitchen</option>
                    <option value="religious">Religious Organization</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-sm font-medium text-gray-700">Service Area</label>
                  <input
                    type="text" name="service_area"
                    placeholder="e.g. Colombo district"
                    value={formData.service_area} onChange={handleChange}
                    className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            {/* Phone + City */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="text" name="phone"
                  placeholder="07X XXXXXXX"
                  value={formData.phone} onChange={handleChange}
                  className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text" name="city"
                  placeholder="e.g. Colombo"
                  value={formData.city} onChange={handleChange}
                  className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text" name="address"
                placeholder="Street address"
                value={formData.address} onChange={handleChange}
                className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Safety Notice */}
            <div className="rounded-lg bg-[#f3f6ef] p-3 text-xs leading-relaxed text-gray-500">
              By registering, you agree to use this platform responsibly and ensure all food donations meet safety standards.
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Creating Account..." : `Create ${formData.role === "donor" ? "Donor" : "Charity"} Account`}
            </button>
          </form>

    </AuthFrame>
  );
};

export default Register;
