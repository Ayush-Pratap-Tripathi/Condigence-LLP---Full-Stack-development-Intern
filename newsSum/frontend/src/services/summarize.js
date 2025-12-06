// src/services/summarize.js
import api from "./api";

/**
 * summarizeArticle
 * POSTs the full article object to backend /summarize/ endpoint.
 * Expects backend to be authenticated via your api axios instance (with Authorization header).
 *
 * @param {Object} article - full article object (title, content/text, url, image, etc.)
 * @returns {Promise<Object>} - { summary, saved_id, saved_collection } on success
 * @throws - will throw axios error on network / server failure
 */
export async function summarizeArticle(article) {
  // be explicit about payload shape (backend accepts full article)
  const payload = {
    ...article,
    // normalize field names if needed, e.g. ensure `content` exists
    content: article.content || article.text || article.raw?.content || "",
    description: article.description || article.summary || "",
  };

  const res = await api.post("/summarize/", payload);
  return res.data;
}
