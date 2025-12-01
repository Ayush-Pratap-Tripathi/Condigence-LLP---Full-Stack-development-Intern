// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../services/api";
import ShimmerCard from "../components/ShimmerCard";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) setUser(JSON.parse(u));

    fetchSummaries();
    fetchArticles();
  }, []);

  const fetchSummaries = async () => {
    try {
      // In future -> const res = await api.get("/summaries/");
      setSummaries([]); // for now empty
    } catch (err) {
      console.error(err);
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      // In future -> const res = await api.get("/news/");
      // setArticles(res.data.articles);

      await new Promise((resolve) => setTimeout(resolve, 800)); // simulated delay
      setArticles([]); // empty for now
    } catch (err) {
      console.error(err);
      toast.error("Failed to load articles");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenSummary = (s) => {
    toast.info(`Open summary: ${s.title}`);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    toast.info("Logged out");
    window.location.href = "/login";
  };

  return (
    <div className="flex h-screen">
      <Sidebar
        user={user}
        summaries={summaries}
        onOpenSummary={handleOpenSummary}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-auto bg-gray-50">
        <Header />

        <div className="p-6">
          {/* Top section */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Discover news</h1>
              <p className="text-sm text-gray-500">Summarized, curated, and ready for study.</p>
            </div>

            <div>
              <button
                onClick={fetchArticles}
                className="px-4 py-2 rounded bg-primary text-white"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* TAG LIST REMOVED COMPLETELY */}

          {/* Content Section */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShimmerCard key={i} />
              ))}
            </div>
          ) : articles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center text-gray-300">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M4 6h16M4 12h16M4 18h16"
                    stroke="#CBD5E1"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No articles found</h3>
              <p className="text-sm text-gray-500">
                Try clicking Refresh to get the latest news.
              </p>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {articles.map((a) => (
                <motion.div
                  key={a.id}
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-lg shadow p-4 flex flex-col"
                >
                  <div className="h-40 bg-gray-100 rounded mb-3 flex items-center justify-center text-gray-400">
                    No image
                  </div>
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 flex-1">{a.description}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 rounded bg-primary text-white text-sm">
                        Summarize
                      </button>
                      <button className="px-3 py-1 rounded border text-sm">
                        Read full
                      </button>
                    </div>
                    <div className="text-xs text-gray-400">2h ago</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
