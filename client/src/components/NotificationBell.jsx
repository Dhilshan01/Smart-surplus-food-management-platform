import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const typeIcon = {
  urgent: "!",
  claimed: "C",
  collected: "OK",
  expired: "EXP",
  general: "N",
};

const typeStyles = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  claimed: "bg-green-100 text-green-700 border-green-200",
  collected: "bg-blue-100 text-blue-700 border-blue-200",
  expired: "bg-orange-100 text-orange-700 border-orange-200",
  general: "bg-gray-100 text-gray-700 border-gray-200",
};

const NotificationBell = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ref = useRef(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(
        "http://localhost:5000/api/notifications/unread-count",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setUnreadCount(res.data.count);
    } catch {
      setUnreadCount(0);
    }
  }, [token]);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load notifications");
    }
    finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    const nextOpen = !open;
    setOpen(nextOpen);
    if (nextOpen) fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    try {
      await axios.patch(
        "http://localhost:5000/api/notifications/mark-all-read",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update notifications");
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      setError(err.response?.data?.message || "Could not update notification");
    }
  };

  const previewMessage = (message) => {
    if (!message) return "No details provided.";
    return message.length > 130 ? `${message.slice(0, 127)}...` : message;
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open notifications"
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-full border shadow-sm transition ${
          open
            ? "border-green-500 bg-green-50 text-green-700"
            : "border-gray-200 bg-white text-gray-700 hover:border-green-300 hover:bg-green-50 hover:text-green-700"
        }`}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M10.27 21a2 2 0 0 0 3.46 0" />
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed right-4 top-16 z-[100] w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl sm:absolute sm:right-0 sm:top-12 sm:w-96">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-950">
                Notifications
              </h3>
              <p className="mt-0.5 text-xs text-gray-500">
                {unreadCount} unread
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="whitespace-nowrap text-xs font-semibold text-green-700 hover:text-green-800"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="py-10 text-center text-sm text-gray-500">
                Loading notifications...
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <p className="text-sm font-semibold text-red-700">Notification preview unavailable</p>
                <p className="mt-1 text-xs text-gray-500">{error}</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => !n.is_read && handleMarkRead(n.id)}
                  className={`cursor-pointer border-b border-gray-100 px-4 py-3 transition ${
                    !n.is_read
                      ? "bg-green-50 hover:bg-green-100"
                      : "bg-white hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold ${
                        typeStyles[n.type] || typeStyles.general
                      }`}
                    >
                      {typeIcon[n.type] || typeIcon.general}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold leading-snug ${
                          !n.is_read ? "text-gray-950" : "text-gray-700"
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="mt-1 line-clamp-2 break-words text-sm leading-relaxed text-gray-600">
                        {previewMessage(n.message)}
                      </p>
                      <p className="mt-2 text-xs text-gray-500">
                        {new Date(n.created_at).toLocaleString()}
                      </p>
                    </div>
                    {!n.is_read && (
                      <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-green-600" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
