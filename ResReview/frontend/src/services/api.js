// src/services/api.js
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: BASE_URL,
  // withCredentials: true, // enable if your backend uses cookies
});

// ✅ 1. Attach token automatically to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ 2. Handle expired token globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or unauthorized
      localStorage.removeItem("token");
      alert("Session expired. Please log in again.");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export async function analyzeResume(formData) {
  const token = localStorage.getItem("token");
  const headers = {
    "Content-Type": "multipart/form-data",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  try {
    const res = await api.post("/resumes/analyze", formData, { headers });
    return res.data;
  } catch (err) {
    if (err.response) throw err.response.data || err.response;
    throw err;
  }
}

export async function loginUser(credentials) {
  const res = await api.post("/auth/login", credentials, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function registerUser(payload) {
  const res = await api.post("/auth/register", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function getUserResumes(userId) {
  const token = localStorage.getItem("token");
  const res = await api.get(`/resumes/user/${userId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export default api;
