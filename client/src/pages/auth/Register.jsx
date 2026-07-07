import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <span className="text-4xl">🍱</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-3">Create your account</h1>
            <p className="text-gray-400 text-sm mt-1">Join FoodShare and start making a difference</p>
          </div>

          {/* Role Selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { value: "donor", label: "Food Donor", icon: "🍱", desc: "Restaurant, bakery, hotel" },
              { value: "charity", label: "Charity / NGO", icon: "🤝", desc: "Community organization" },
            ].map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setFormData({ ...formData, role: r.value })}
                className={`p-4 rounded-2xl border-2 text-left transition ${
                  formData.role === r.value
                    ? "border-green-500 bg-green-50"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <p className={`text-sm font-semibold mt-2 ${
                  formData.role === r.value ? "text-green-700" : "text-gray-800"
                }`}>
                  {r.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{r.desc}</p>
              </button>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                type="text" name="full_name"
                placeholder="Your full name"
                value={formData.full_name} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input
                type="email" name="email"
                placeholder="you@example.com"
                value={formData.email} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password" name="password"
                placeholder="Min 6 characters"
                value={formData.password} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization Name
                <span className="text-gray-400 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="text" name="organization_name"
                placeholder={formData.role === "donor" ? "e.g. Colombo Bakery" : "e.g. Hope Foundation"}
                value={formData.organization_name} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {formData.role === "donor" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Registration Number
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <input
                    type="text" name="registration_number"
                    placeholder="Business reg. no."
                    value={formData.registration_number} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Type</label>
                  <select
                    name="business_type"
                    value={formData.business_type} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Registration Number
                    <span className="text-gray-400 font-normal ml-1">(optional)</span>
                  </label>
                  <input
                    type="text" name="registration_number"
                    placeholder="Charity reg. no."
                    value={formData.registration_number} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Charity Type</label>
                  <select
                    name="charity_type"
                    value={formData.charity_type} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Select type</option>
                    <option value="ngo">NGO</option>
                    <option value="shelter">Shelter</option>
                    <option value="community_kitchen">Community Kitchen</option>
                    <option value="religious">Religious Organization</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Area</label>
                  <input
                    type="text" name="service_area"
                    placeholder="e.g. Colombo district"
                    value={formData.service_area} onChange={handleChange}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                  />
                </div>
              </div>
            )}

            {/* Phone + City */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input
                  type="text" name="phone"
                  placeholder="07X XXXXXXX"
                  value={formData.phone} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">City</label>
                <input
                  type="text" name="city"
                  placeholder="e.g. Colombo"
                  value={formData.city} onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input
                type="text" name="address"
                placeholder="Street address"
                value={formData.address} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
              />
            </div>

            {/* Safety Notice */}
            <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-400 leading-relaxed">
              By registering, you agree to use this platform responsibly and ensure all food donations meet safety standards.
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm"
            >
              {loading ? "Creating Account..." : `Create ${formData.role === "donor" ? "Donor" : "Charity"} Account`}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-green-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
