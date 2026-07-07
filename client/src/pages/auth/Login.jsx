import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import AuthFrame from "../../components/AuthFrame";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
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
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      login(res.data.token, res.data.user);

      if (res.data.user.role === "donor") navigate("/donor/dashboard");
      else if (res.data.user.role === "charity") navigate("/charity/dashboard");
      else navigate("/admin/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.request ? "Cannot reach the server. Check that the backend is running on port 5000." : "Login failed"),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame
      compact
      contentClassName="max-w-sm"
      eyebrow="Welcome back"
      title="Sign in"
      subtitle="Access your verified workspace for surplus listings, donations, purchases, and reports."
      footer={(
        <p className="text-center text-sm text-[#748074]">
          Don't have an account?{" "}
          <Link to="/register" className="font-bold text-emerald-700 hover:underline">
            Register free
          </Link>
        </p>
      )}
    >
      {error && (
        <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-semibold text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-bold text-[#344139]">Email Address</label>
          <input
            type="email"
            name="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-bold text-[#344139]">Password</label>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-[#dfe4d7] bg-[#f9fbf6] px-3 py-2.5 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-1 w-full rounded-lg bg-[#18251d] py-2.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </AuthFrame>
  );
};

export default Login;
