// src/pages/Dashboard.jsx
import ResumesTable from "../components/ResumesTable";
import React, { useEffect, useState } from "react";
import { analyzeResume } from "../services/api";

const Dashboard = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [jobRole, setJobRole] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0); // 👈 triggers table reload

  const handleFileChange = (e) => setFile(e.target.files[0]);

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please log in to access the dashboard.");
    window.location.href = "/login";
  }
}, []);


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
    formData.append("jobRole", jobRole);

    setLoading(true);
    setMessage("Analyzing your resume...");

    try {
      const data = await analyzeResume(formData);
      setResult(data);
      setMessage("✅ Analysis complete");

      // 🔥 Trigger table refresh instantly after success
      setRefreshTrigger((prev) => prev + 1);
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
        {/* Resume Analyzer Card */}
        <div className="bg-white shadow-lg rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl animate-slideUp">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Resume Analyzer
          </h2>

          {/* Job Role input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Role
            </label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g., Frontend Developer"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <form onSubmit={handleAnalyze} className="space-y-4 mt-4">
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

          {message && (
            <p
              className={`mt-4 text-center text-sm ${
                message.startsWith("✅")
                  ? "text-green-600"
                  : message.startsWith("❌")
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              {message}
            </p>
          )}

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

        {/* 🔽 Resume Table Section */}
        <div className="mt-12">
          <h3 className="text-lg font-semibold text-gray-700 mb-3">
            Your Uploaded Resumes
          </h3>

          {/* Pass refreshTrigger so table updates instantly */}
          <ResumesTable refreshTrigger={refreshTrigger} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
