// src/components/SummaryModal.jsx
import React from "react";
import { motion } from "framer-motion";
import { FiX, FiDownload } from "react-icons/fi";

/**
 * SummaryModal
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - article: object (title, publishedAt, url)
 * - loading: boolean
 * - summary: string|null
 * - onDownload: () => void
 */
export default function SummaryModal({
  open,
  onClose,
  article,
  loading,
  summary,
  onDownload,
}) {
  if (!open) return null;

  const published = article?.publishedAt
    ? new Date(article.publishedAt).toLocaleString()
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 8 }}
        className="relative z-10 max-w-3xl w-full mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-700">
              {article?.title || "Summary"}
            </h3>
            <div className="text-xs text-gray-500">
              {published} •{" "}
              {article?.source?.name || article?.source || "Unknown source"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (onDownload) onDownload();
              }}
              title="Download summary as PDF"
              className="px-3 py-1 rounded-md bg-indigo-50 text-indigo-600 text-sm flex items-center gap-2"
            >
              <FiDownload />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded hover:bg-gray-100 text-gray-600"
              title="Close"
            >
              <FiX size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 max-h-[65vh] overflow-auto">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/5 animate-pulse" />
              <div className="h-3 bg-gray-200 rounded w-4/5 animate-pulse" />
              <div className="h-40 bg-gray-100 rounded animate-pulse" />
            </div>
          ) : summary ? (
            <div className="prose max-w-none text-gray-700">
              {summary.split("\n\n").map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <hr className="my-4" />
              <div className="text-sm text-gray-500">
                Source:{" "}
                {article?.url ? (
                  <a
                    href={article.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-indigo-600 underline"
                  >
                    Open original
                  </a>
                ) : (
                  article?.source?.name || article?.source || "Unknown"
                )}
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-500">No summary yet.</div>
          )}
        </div>

        <div className="flex items-center justify-end px-5 py-3 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-100 text-sm text-gray-700"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
