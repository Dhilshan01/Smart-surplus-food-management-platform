import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" />;
  if (user.role !== "admin" && user.verification_status !== "verified") {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-lg border border-amber-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-amber-700">Verification required</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">Your account is waiting for admin approval</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            You can sign in, but platform features are locked until an admin verifies your business or charity profile.
          </p>
          <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            Current status: {user.verification_status || "pending"}
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
