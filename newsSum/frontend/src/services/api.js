import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE;

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

export const getNews = (params = {}) => {
  // params: { q, category, country, lang, max, page, sortby }
  return api.get("/news/", { params });
};

export const getUserSummaries = async () => {
  const res = await api.get("/../summaries/");
  return res.data; // { summaries: [...] }
};

export const deleteUserSummary = async (summaryId) => {
  // hits: /api/summaries/<id>/
  return api.delete(`/../summaries/${summaryId}/`);
};

export const downloadUserSummary = async (summaryId) => {
  const res = await api.get(`/../summaries/${summaryId}/download/`, {
    responseType: "blob",
  });
  return res;
};

export default api;
