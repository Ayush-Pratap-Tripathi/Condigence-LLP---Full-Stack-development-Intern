// src/pages/HistoryPage.jsx
import React, { useEffect, useState } from "react";
import PrivateRoute from "../components/PrivateRoute";
import {
  getSearchHistory,
  deleteSearchHistoryItem,
  clearSearchHistory,
  getReadHistory,
  deleteReadHistoryItem,
  clearReadHistory,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
};

const HistoryPageInner = () => {
  const [activeTab, setActiveTab] = useState("search"); // "search" | "read"
  const [searches, setSearches] = useState([]);
  const [reads, setReads] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSearches = async () => {
    setLoading(true);
    try {
      const res = await getSearchHistory();
      setSearches(res.data || []);
    } catch (e) {
      console.error("Failed to load search history", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchReads = async () => {
    setLoading(true);
    try {
      const res = await getReadHistory();
      setReads(res.data || []);
    } catch (e) {
      console.error("Failed to load read history", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSearches();
    fetchReads();
  }, []);

  const handleDeleteSearch = async (id) => {
    try {
      await deleteSearchHistoryItem(id);
      setSearches((s) => s.filter((i) => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearSearches = async () => {
    try {
      await clearSearchHistory();
      setSearches([]);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRead = async (id) => {
    try {
      await deleteReadHistoryItem(id);
      setReads((r) => r.filter((i) => i.id !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearReads = async () => {
    try {
      await clearReadHistory();
      setReads([]);
    } catch (e) {
      console.error(e);
    }
  };
  const navigate = useNavigate();

  const goBack = () => {
    try {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate("/dashboard");
      }
    } catch (e) {
      navigate("/dashboard");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100"
          aria-label="Go back to dashboard"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>
      <h1 className="text-2xl font-semibold mb-4">My History</h1>

      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => setActiveTab("search")}
          className={
            "px-3 py-1 rounded " +
            (activeTab === "search"
              ? "bg-indigo-600 text-white"
              : "bg-gray-100")
          }
        >
          Search History ({searches.length})
        </button>

        <button
          onClick={() => setActiveTab("read")}
          className={
            "px-3 py-1 rounded " +
            (activeTab === "read" ? "bg-indigo-600 text-white" : "bg-gray-100")
          }
        >
          Article History ({reads.length})
        </button>

        <div className="ml-auto flex gap-2">
          {activeTab === "search" ? (
            <button
              onClick={handleClearSearches}
              className="px-3 py-1 rounded bg-red-500 text-white"
            >
              Clear Searches
            </button>
          ) : (
            <button
              onClick={handleClearReads}
              className="px-3 py-1 rounded bg-red-500 text-white"
            >
              Clear Reads
            </button>
          )}
        </div>
      </div>

      <div>
        {loading && <div>Loading...</div>}

        {activeTab === "search" && (
          <div className="space-y-3">
            {searches.length === 0 && (
              <div className="text-gray-500">No searches yet.</div>
            )}
            {searches.map((s) => (
              <div
                key={s.id}
                className="p-3 border rounded flex items-start justify-between"
              >
                <div>
                  <div className="font-medium">{s.query}</div>
                  <div className="text-sm text-gray-500">
                    {s.filters ? JSON.stringify(s.filters) : ""}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(s.created_at)}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDeleteSearch(s.id)}
                    className="px-3 py-1 rounded bg-red-100 text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "read" && (
          <div className="space-y-3">
            {reads.length === 0 && (
              <div className="text-gray-500">No article reads yet.</div>
            )}
            {reads.map((r) => (
              <div
                key={r.id}
                className="p-3 border rounded flex items-start justify-between"
              >
                <div>
                  <div className="font-medium">
                    {r.article_meta?.title || r.article_id}
                  </div>
                  <div className="text-sm text-gray-500">
                    {r.article_meta?.source || ""}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(r.created_at)}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDeleteRead(r.id)}
                    className="px-3 py-1 rounded bg-red-100 text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HistoryPage = () => (
  <PrivateRoute>
    <HistoryPageInner />
  </PrivateRoute>
);

export default HistoryPage;
