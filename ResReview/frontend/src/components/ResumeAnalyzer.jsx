// src/components/ResumeAnalyzer.jsx
import React, { useState } from "react";
import { analyzeResume } from "../services/api";
import depictable from "../assets/Depictable.png";

export default function ResumeAnalyzer({ onAnalysisComplete }) {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [jobRole, setJobRole] = useState("");

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
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
      await analyzeResume(formData);
      setMessage("✅ Analysis complete");
      onAnalysisComplete();
    } catch {
      setMessage("❌ Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col lg:flex-row items-center justify-between gap-4 bg-white/60 backdrop-blur-2xl rounded-2xl p-6 shadow-lg border border-white/40 hover:shadow-blue-200/60 transition-all duration-500">
      {/* Left - Inputs */}
      <div className="w-full lg:w-1/2 space-y-4">
        <h2 className="text-2xl font-bold text-blue-800">Resume Analyzer</h2>
        <p className="text-gray-600 text-sm">
          Upload candidate’s resume and see how well it matches the job.
        </p>

        <form onSubmit={handleAnalyze} className="space-y-3 mt-3">
          <input
            type="text"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            placeholder="Job Role"
            className="w-full p-2.5 rounded-lg bg-white/70 border border-blue-100 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all text-sm"
          />

          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={4}
            placeholder="Paste the job description here..."
            className="w-full p-2.5 rounded-lg bg-white/70 border border-blue-100 focus:ring-2 focus:ring-blue-400 focus:outline-none transition-all text-sm"
          />

          <div className="relative w-full">
            <label className="flex items-center justify-between p-2.5 rounded-lg bg-white/70 border border-blue-100 cursor-pointer hover:bg-blue-50 transition-all text-sm">
              <span>{file ? file.name : "Choose resume file (.pdf)"}</span>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs">Browse</span>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300 text-sm"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </form>

        {message && (
          <p
            className={`text-sm mt-2 ${
              message.startsWith("✅")
                ? "text-green-600"
                : message.startsWith("❌")
                ? "text-red-600"
                : "text-gray-600"
            } animate-fadeIn`}
          >
            {message}
          </p>
        )}
      </div>

      {/* Right - Image */}
      <div className="hidden lg:flex w-1/2 justify-center items-center">
        <img
          src={depictable}
          alt="Resume Illustration"
          className="w-3/5 max-w-[260px] drop-shadow-2xl animate-float"
        />
      </div>
    </section>
  );
}
