import axios from "axios";

const defaultApiUrl =
  typeof window !== "undefined" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1"
    ? `${window.location.protocol}//${window.location.hostname}:5000`
    : "http://localhost:5000";

export const API_URL = (import.meta.env.VITE_API_URL || defaultApiUrl).replace(/\/$/, "");

axios.defaults.baseURL = API_URL;
axios.interceptors.request.use((config) => {
  if (typeof config.url === "string") {
    config.url = config.url.replace(/^http:\/\/localhost:5000/, API_URL);
  }
  return config;
});
