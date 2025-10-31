// src/pages/Dashboard.jsx
import React, { useState } from "react";
import { analyzeResume } from "../services/api";

const Dashboard = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);

    if (!file || !jobDescription.trim()) {
      setMessage("❌ Please fill all fields.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("jobDescription", jobDescription);

    setLoading(true);
    setMessage("Analyzing your resume...");

    try {
      const data = await analyzeResume(formData);
      setResult(data);
      setMessage("✅ Analysis complete");
    } catch (err) {
      console.error(err);
      setMessage("❌ Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50 animate-fadeIn">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white shadow-lg rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl animate-slideUp">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Resume Analyzer
          </h2>

          <form onSubmit={handleAnalyze} className="space-y-4">
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={6}
              placeholder="Paste the job description here..."
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-400 transition-all"
            />

            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="text-sm"
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md"
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analyzing...
                </div>
              ) : (
                "Analyze Resume"
              )}
            </button>
          </form>

          {message && <p className="mt-4 text-center text-sm">{message}</p>}

          {result && (
            <div className="mt-8 border-t pt-6 animate-fadeIn">
              <h3 className="text-xl font-semibold text-gray-800">Results</h3>
              <div className="mt-4 space-y-2">
                <p>
                  <strong>ATS Score:</strong> {result.atsScore || 0}%
                </p>
                <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, result.atsScore)}%` }}
                    className={`h-4 transition-all duration-700 ${
                      result.atsScore >= 80
                        ? "bg-green-600"
                        : result.atsScore >= 60
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                </div>
                <p>
                  <strong>Match %:</strong> {result.matchPercentage || 0}%
                </p>
                <p>
                  <strong>Rating:</strong> {result.rating || "N/A"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
