import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100";

const ChangePasswordPanel = ({ compact = false }) => {
  const { token } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handlePasswordChange = (event) => {
    setPasswordData({ ...passwordData, [event.target.name]: event.target.value });
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setChangingPassword(true);
    setPasswordMessage("");
    setPasswordError("");

    try {
      const res = await axios.patch("http://localhost:5000/api/auth/change-password", passwordData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPasswordMessage(res.data.message || "Password changed successfully.");
      setPasswordData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Could not change password");
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <form
      onSubmit={handlePasswordSubmit}
      className={compact ? "grid gap-4" : "grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-2"}
    >
      <div className="sm:col-span-2">
        <h3 className="text-sm font-black text-slate-950">Change password</h3>
        <p className="mt-1 text-xs text-slate-500">Enter your current password before setting a new one.</p>
      </div>

      {passwordMessage && (
        <p className="sm:col-span-2 rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-700">{passwordMessage}</p>
      )}
      {passwordError && (
        <p className="sm:col-span-2 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-700">{passwordError}</p>
      )}

      <div className="sm:col-span-2">
        <label className="mb-1.5 block text-xs font-bold text-slate-600">Current password</label>
        <input
          type="password"
          name="current_password"
          value={passwordData.current_password}
          onChange={handlePasswordChange}
          className={inputClass}
          autoComplete="current-password"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-600">New password</label>
        <input
          type="password"
          name="new_password"
          value={passwordData.new_password}
          onChange={handlePasswordChange}
          className={inputClass}
          autoComplete="new-password"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-bold text-slate-600">Confirm password</label>
        <input
          type="password"
          name="confirm_password"
          value={passwordData.confirm_password}
          onChange={handlePasswordChange}
          className={inputClass}
          autoComplete="new-password"
        />
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={changingPassword}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-60"
        >
          {changingPassword ? "Changing..." : "Change password"}
        </button>
      </div>
    </form>
  );
};

export default ChangePasswordPanel;
