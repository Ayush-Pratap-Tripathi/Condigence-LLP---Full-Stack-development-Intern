// src/pages/ArticlePage.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function ArticlePage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    // priority: location.state (navigate passed article), then sessionStorage fallback
    const fromState = location?.state?.article;
    if (fromState) {
      setArticle(fromState);
      // keep in sessionStorage as fallback (in case user reloads)
      try {
        sessionStorage.setItem("currentArticle", JSON.stringify(fromState));
      } catch (e) {}
      setLoading(false);
      return;
    }

    // fallback: try sessionStorage
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

    // nothing found
    setLoading(false);
  }, [location]);

  const handleBack = () => {
    // clear fallback storage and go back
    try {
      sessionStorage.removeItem("currentArticle");
    } catch (e) {}
    navigate(-1); // go back to previous page
  };

  const handleSummarize = async () => {
    if (!article) return;
    setSummarizing(true);
    try {
      // placeholder: call your backend summarize endpoint here
      // example:
      // const res = await api.post("/summarize/", { title: article.title, content: article.content, url: article.url, source: article.source });
      // toast.success("Summary generated and saved.");
      toast.info("Summarize action not implemented yet.");
    } catch (err) {
      console.error("Summarize failed", err);
      toast.error("Failed to summarize.");
    } finally {
      setSummarizing(false);
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
      <div className="min-h-screen p-6">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-lg font-semibold">No article to display</h3>
          <p className="text-sm text-gray-500 mt-2">
            Open an article from the dashboard or go back.
          </p>
          <div className="mt-4">
            <button
              onClick={handleBack}
              className="px-4 py-2 rounded bg-primary text-white"
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

  // Small internal component to handle image loading errors gracefully.
  // Shows the same "Failed to load image: <url>" message as on the dashboard when load fails.
  function ArticleImage({ src, title }) {
    const [error, setError] = useState(null);
    const [loaded, setLoaded] = useState(false);

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
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
        }}
      />
    );
  }

  return (
    <div className="flex h-screen">
      <Sidebar
        user={JSON.parse(localStorage.getItem("user") || "null")}
        summaries={[]}
        onLogout={() => {
          localStorage.clear();
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
                className="p-2 rounded-md hover:bg-gray-100 border"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
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
                className="px-4 py-2 rounded-md bg-primary text-blue-700 hover:brightness-95 flex items-center gap-2"
              >
                {summarizing ? "Summarizing…" : "Summarize"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Use the ArticleImage component to render the image with graceful error handling */}
            <ArticleImage src={article.image} title={article.title} />

            <div className="p-6">
              {article.description ? (
                <p className="text-lg text-gray-700 mb-4">
                  {article.description}
                </p>
              ) : null}

              <div className="prose max-w-none text-gray-700">
                {/* article.content may include truncated text with [NN chars]. Show as-is.
                    If you have 'raw' full content in article.raw, use that. */}
                <p>
                  {article.content ||
                    article.description ||
                    "Full content not available."}
                </p>

                {/* if article.raw has more fields (like full text), you can render them here */}
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
                      className="text-primary underline"
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
    </div>
  );
}
