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

export default api;

export const getSearchHistory = async () => {
  return api.get("/history/search/");
};

export const deleteSearchHistoryItem = async (id) => {
  return api.delete(`/history/search/${id}/`);
};

export const clearSearchHistory = async () => {
  return api.delete(`/history/search/clear/`);
};

export const getReadHistory = async () => {
  return api.get("/history/read/");
};

export const deleteReadHistoryItem = async (id) => {
  return api.delete(`/history/read/${id}/`);
};

export const clearReadHistory = async () => {
  return api.delete(`/history/read/clear/`);
};

export const getNews = (params = {}) => {
  // params: { q, category, country, lang, max, page, sortby }
  return api.get("/news/", { params });
};
