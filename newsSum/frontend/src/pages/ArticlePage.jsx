// src/pages/ArticlePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import SummaryModal from "../components/SummaryModal";
import { runSummarizeFlow } from "../services/summarizeHandler";
import { deleteUserSummary } from "../services/api";
import { downloadUserSummary } from "../services/api";
import triggerFileDownload from "../services/downloadHelper";
import { getUserSummaries } from "../services/api";

export default function ArticlePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);
  const [summaries, setSummaries] = useState([]);
  const [savedSummaryArticle, setSavedSummaryArticle] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalSummary, setModalSummary] = useState(null);

  useEffect(() => {
    const fromState = location?.state?.article;
    if (fromState) {
      setArticle(fromState);
      try {
        sessionStorage.setItem("currentArticle", JSON.stringify(fromState));
      } catch (e) {}
      setLoading(false);
      return;
    }

    try {
      const raw = sessionStorage.getItem("currentArticle");
      if (raw) {
        setArticle(JSON.parse(raw));
        setLoading(false);
        return;
      }
    } catch (e) {
      console.warn("Failed to read article from sessionStorage", e);
    }

    setLoading(false);
  }, [location]);

  const handleBack = () => {
    try {
      sessionStorage.removeItem("currentArticle");
    } catch (e) {}
    navigate(-1);
  };

  const handleSummarize = async () => {
    if (!article) return;
    setModalOpen(true);
    setModalSummary(null);
    try {
      await runSummarizeFlow(article, {
        setLoading: setModalLoading,
        setSummary: setModalSummary,
        toast,
        onSaved: () => {},
      });
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
      fetchSummaries();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="h-6 w-48 bg-gray-200 rounded mb-3" />
          <div className="h-4 w-40 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-700">
            No article to display
          </h3>
          <p className="text-sm text-gray-500 mt-2">
            Open an article from the dashboard or go back.
          </p>
          <div className="mt-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const published = article.publishedAt
    ? new Date(article.publishedAt).toLocaleString()
    : "";

  function ArticleImage({ src, title }) {
    const [error, setError] = useState(null);

    if (!src) {
      return (
        <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400">
          No image
        </div>
      );
    }

    if (error) {
      return (
        <div className="w-full h-56 flex items-center justify-center text-sm text-red-500 px-3 text-center">
          {`Failed to load image: ${src}`}
        </div>
      );
    }

    return (
      <img
        src={src}
        alt={title}
        className="w-full max-h-96 object-cover"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        user={JSON.parse(localStorage.getItem("user") || "null")}
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

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 rounded-md hover:bg-gray-100 border border-gray-100 text-gray-700"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-700">
                  {article.title}
                </h1>
                <p className="text-sm text-gray-500">
                  {article.source?.name || article.source || ""} • {published}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSummarize}
                disabled={summarizing}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center gap-2"
              >
                {summarizing ? "Summarizing…" : "Summarize"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <ArticleImage src={article.image} title={article.title} />

            <div className="p-6">
              {article.description ? (
                <p className="text-lg text-gray-700 mb-4">
                  {article.description}
                </p>
              ) : null}

              <div className="prose max-w-none text-gray-700">
                <p>
                  {article.content ||
                    article.description ||
                    "Full content not available."}
                </p>
              </div>

              <div className="mt-6 text-sm text-gray-500">
                <div>
                  Source: {article.source?.name || article.source || "Unknown"}
                </div>
                {article.url ? (
                  <div>
                    Original URL:{" "}
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 underline"
                    >
                      Open original
                    </a>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <SummaryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setModalSummary(null);
        }}
        article={article}
        loading={modalLoading}
        summary={modalSummary}
        onDownload={() => {
          toast.info("Download will be implemented soon.");
        }}
      />
    </div>
  );
}
