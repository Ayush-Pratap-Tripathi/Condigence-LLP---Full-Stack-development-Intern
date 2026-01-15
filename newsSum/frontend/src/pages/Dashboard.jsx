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
import { getUserSummaries } from "../services/api";
import { deleteUserSummary } from "../services/api";
import { downloadUserSummary } from "../services/api";
import triggerFileDownload from "../services/downloadHelper";

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
  const [savedSummaryArticle, setSavedSummaryArticle] = useState(null);

  const openAndSummarize = async (article) => {
    setActiveArticle(article);
    setModalSummary(null);
    setModalOpen(true);
    try {
      await runSummarizeFlow(article, {
        setLoading: setModalLoading,
        setSummary: setModalSummary,
        toast,
        onSaved: ({ saved_id }) => {
          setSavedSummaryArticle({
            _id: saved_id,
            title: article.title,
            summary: modalSummary,
            source_url: article.url,
            created_at: new Date().toISOString(),
          });
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
      const res = await getUserSummaries();
      setSummaries(res.summaries || []);
    } catch (err) {
      console.error("Failed to fetch summaries", err);
    }
  };

  const handleDeleteSummary = async (summary) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this summary?"
    );
    if (!confirmed) return;

    try {
      await deleteUserSummary(summary._id);
      setSummaries((prev) => prev.filter((s) => s._id !== summary._id));
      toast.success("Summary deleted");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete summary");
    }
  };

  const handleDownloadSummary = async (summary) => {
    try {
      toast.info("Preparing download…");
      const res = await downloadUserSummary(summary._id);

      const filename =
        res.headers["content-disposition"]
          ?.split("filename=")[1]
          ?.replaceAll('"', "") || `summary_${summary._id}.pdf`;

      triggerFileDownload(res.data, filename);
      toast.success("Download started");
    } catch (err) {
      console.error("Download failed", err);
      toast.error("Failed to download summary");
    }
  };

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await api.get("/news/");
      setArticles(res.data.articles || []);
    } catch (err) {
      console.error("Failed to load news", err);
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  };

  function ArticleImage({ src, title }) {
    const [error, setError] = useState(null);

    if (!src) {
      return (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          No image
        </div>
      );
    }

    if (error) {
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
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        user={user}
        summaries={summaries}
        onOpenSummary={(s) => {
          setSavedSummaryArticle(s);
          setModalSummary(s.summary);
          setModalLoading(false);
          setModalOpen(true);
        }}
        onDeleteSummary={handleDeleteSummary}
        onDownloadSummary={handleDownloadSummary}
        onLogout={() => {
          localStorage.clear();
          toast.info("Logged out");
          window.location.href = "/login";
        }}
      />

      <main className="flex-1 overflow-auto bg-gray-50">
        <Header />

        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-700">
                Discover news
              </h1>
              <p className="text-sm text-gray-500">
                Summarized, curated, and ready for study.
              </p>
            </div>

            <button
              onClick={fetchArticles}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Refresh
            </button>
          </div>

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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
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
                  <h3 className="font-semibold text-gray-700">{a.title}</h3>
                  <p className="text-sm text-gray-600 flex-1">
                    {a.description}
                  </p>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openAndSummarize(a)}
                        className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
                      >
                        Summarize
                      </button>

                      <button
                        onClick={() => {
                          try {
                            sessionStorage.setItem(
                              "currentArticle",
                              JSON.stringify(a)
                            );
                          } catch (e) {}
                          navigate("/article", { state: { article: a } });
                        }}
                        className="px-3 py-1 rounded border border-gray-100 text-gray-600 text-sm hover:bg-gray-50"
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
          setSavedSummaryArticle(null);
        }}
        article={activeArticle || savedSummaryArticle || {}}
        loading={modalLoading}
        summary={modalSummary}
        onDownload={() => {
          if (!savedSummaryArticle?._id) {
            toast.error("This summary is not saved yet");
            return;
          }
          handleDownloadSummary(savedSummaryArticle);
        }}
      />
    </div>
  );
};

export default Dashboard;
