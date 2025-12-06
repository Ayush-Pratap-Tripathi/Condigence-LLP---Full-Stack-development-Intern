// src/services/summarizeHandler.js
import { summarizeArticle } from "./summarize";

/**
 * runSummarizeFlow - single entrypoint for UI code.
 *
 * @param {Object} article - article object
 * @param {Object} callbacks - { setLoading, setSummary, toast, onSaved(optional) }
 *
 * Returns the summary on success.
 */
export async function runSummarizeFlow(article, callbacks = {}) {
  const { setLoading, setSummary, toast, onSaved } = callbacks;
  try {
    if (setLoading) setLoading(true);
    if (setSummary) setSummary(null);

    const res = await summarizeArticle(article);
    const { summary, saved_id, saved_collection } = res;

    if (setSummary) setSummary(summary);
    if (toast) toast.success("Summary generated and saved.");
    if (typeof onSaved === "function") onSaved({ saved_id, saved_collection });

    return { summary, saved_id, saved_collection };
  } catch (err) {
    console.error("Summarize error:", err);
    if (toast) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to summarize";
      toast.error(msg);
    }
    throw err;
  } finally {
    if (setLoading) setLoading(false);
  }
}
