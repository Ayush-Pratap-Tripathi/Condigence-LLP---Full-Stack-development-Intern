import axios from "axios";

const API_BASE =
  process.env.REACT_APP_API_BASE || "http://127.0.0.1:8000/api/auth";

const getAccessToken = () => localStorage.getItem("accessToken");

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
