// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import api from "../services/api";
import ShimmerCard from "../components/ShimmerCard";
import { useNavigate } from "react-router-dom";
import SummaryModal from "../components/SummaryModal";
import { runSummarizeFlow } from "../services/summarizeHandler";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [summaries, setSummaries] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const [modalOpen, setModalOpen] = useState(false);
  const [activeArticle, setActiveArticle] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSummary, setModalSummary] = useState(null);

  const openAndSummarize = async (article) => {
    setActiveArticle(article);
    setModalSummary(null);
    setModalOpen(true);
    try {
      await runSummarizeFlow(article, {
        setLoading: setModalLoading,
        setSummary: setModalSummary,
        toast,
        onSaved: () => {
          // optionally refresh sidebar summaries list
          fetchSummaries();
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

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

  const getYesterdayDateInKolkata = () => {
    try {
      // produce "YYYY-MM-DD" for current date in Asia/Kolkata
      const todayStr = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Kolkata",
      }).format(new Date()); // e.g. "2025-12-04"

      // build a Date using the components (safe: local midnight for that Y-M-D)
      const [yyyy, mm, dd] = todayStr.split("-").map((s) => Number(s));
      const d = new Date(yyyy, mm - 1, dd);

      // subtract one day
      d.setDate(d.getDate() - 1);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch (e) {
      // fallback: use local yesterday (less accurate if user isn't in IST)
      const d = new Date();
      d.setDate(d.getDate() - 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
  };

  const fetchArticles = async (opts = {}) => {
    setLoading(true);
    try {
      // compute date (allow override via opts.date for testing)
      const dateToUse = opts.date || getYesterdayDateInKolkata();

      const params = {
        max: opts.max || 12,
        page: opts.page || 1,
        q: opts.q || undefined,
        category: opts.category || undefined,
        country: opts.country || undefined,
        lang: opts.lang || "en",
        sortby: opts.sortby || undefined,
        // IMPORTANT: pass yesterday's date
        date: dateToUse,
      };

      // adjust path if your axios baseURL differs; this assumes api.get("/news/") maps to /api/auth/news/
      const res = await api.get("/news/", { params });
      const articles = res.data.articles || [];
      setArticles(articles);
    } catch (err) {
      console.error("Failed to load news", err);
      toast.error("Failed to load news");
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

  // --- Small child component to handle image load errors and display message ---
  function ArticleImage({ src, title }) {
    const [error, setError] = useState(null);
    const [loaded, setLoaded] = useState(false);

    // If no src provided, render the "No image" placeholder
    if (!src) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No image
        </div>
      );
    }

    // If error occurred while loading, show the requested message
    if (error) {
      // Use the src (URL) as the "error" information because browsers don't expose HTTP status in img onError
      return (
        <div className="w-full h-full flex items-center justify-center text-sm text-red-500 px-3 text-center">
          {`Failed to load image: ${src}`}
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={title}
        className="w-full h-full object-cover"
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          // mark error; browsers don't provide detailed error info for images
          // but we can show the URL as the error detail as requested
          setError(true);
        }}
        // avoid infinite onError loop if src replaced; we don't change src here
      />
    );
  }

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
              <h1 className="text-2xl font-semibold text-gray-900">
                Discover news
              </h1>
              <p className="text-sm text-gray-500">
                Summarized, curated, and ready for study.
              </p>
            </div>

            <div>
              <button
                onClick={fetchArticles}
                className="px-4 py-2 rounded bg-primary text-blue-700"
              >
                Refresh
              </button>
            </div>
          </div>

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
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No articles found
              </h3>
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
                  <div className="h-40 bg-gray-100 rounded mb-3 overflow-hidden">
                    <ArticleImage src={a.image} title={a.title} />
                  </div>
                  <h3 className="font-semibold text-gray-900">{a.title}</h3>
                  <p className="text-sm text-gray-600 flex-1">
                    {a.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAndSummarize(a)}
                        className="px-3 py-1 rounded bg-primary text-white text-sm"
                      >
                        Summarize
                      </button>

                      <button
                        onClick={() => {
                          try {
                            // store article in sessionStorage as fallback for reload
                            sessionStorage.setItem(
                              "currentArticle",
                              JSON.stringify(a)
                            );
                          } catch (e) {}
                          navigate("/article", { state: { article: a } });
                        }}
                        className="px-3 py-1 rounded border text-sm"
                      >
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
      <SummaryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalSummary(null);
          setActiveArticle(null);
        }}
        article={activeArticle || {}}
        loading={modalLoading}
        summary={modalSummary}
        onDownload={() => {
          // placeholder: implement actual pdf download later
          toast.info("Download will be implemented soon.");
        }}
      />
    </div>
  );
};

export default Dashboard;
