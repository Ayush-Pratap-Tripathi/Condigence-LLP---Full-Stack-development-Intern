import React, { useState } from "react";
import { analyzeResume } from "../services/api";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  // Optional: if you require login for dashboard, redirect if not logged in
  // if (!token) navigate("/login");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setMessage("");
    setResult(null);

    if (!file) {
      setMessage("❌ Please select a resume file first.");
      return;
    }
    if (!jobDescription || jobDescription.trim().length < 10) {
      setMessage("❌ Please paste the job description (at least 10 characters).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);

      setMessage("Analyzing... this may take a few seconds.");
      const data = await analyzeResume(formData);

      setResult({
        atsScore: data.atsScore,
        matchPercentage: data.matchPercentage,
        rating: data.rating,
        id: data.id,
      });
      setMessage("✅ Analysis complete");
    } catch (err) {
      console.error(err);
      setMessage("❌ Analysis failed: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Resume Analyzer Dashboard</h2>

      <form onSubmit={handleAnalyze} className="space-y-4">
        <div>
          <label className="block font-medium">Job Description</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
            placeholder="Paste the job description here..."
            className="w-full border p-2 rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Resume (PDF / DOCX / TXT)</label>
          <input type="file" accept=".pdf,.docx,.doc,.txt" onChange={handleFileChange} />
        </div>

        <div>
          <button
            type="submit"
            className="px-4 py-2 rounded bg-blue-600 text-white"
          >
            Analyze Resume
          </button>
        </div>
      </form>

      {message && <p className="mt-4">{message}</p>}

      {result && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h3 className="text-xl font-semibold">Results</h3>
          <p><strong>ATS Score:</strong> {result.atsScore}%</p>
          <div className="w-full bg-gray-200 rounded h-4 mt-2">
            <div
              style={{ width: `${Math.max(0, Math.min(100, result.atsScore))}%` }}
              className={`h-4 rounded ${result.atsScore >= 85 ? "bg-green-600" : result.atsScore >= 70 ? "bg-yellow-500" : "bg-red-500"}`}
            />
          </div>
          <p className="mt-2"><strong>Match percentage (embedding):</strong> {result.matchPercentage}%</p>
          <p><strong>Rating:</strong> {result.rating}</p>
          <p className="text-sm text-gray-600 mt-2">Result id: {result.id}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
