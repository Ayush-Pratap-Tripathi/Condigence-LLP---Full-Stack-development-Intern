// src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import ResumeAnalyzer from "../components/ResumeAnalyzer";
import ResumesTable from "../components/ResumesTable";

export default function Dashboard() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in to access the dashboard.");
      window.location.href = "/login";
    }
  }, []);

  const handleAnalysisComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-blue-100">
      <Navbar />

      {/* Hero Section (No scroll needed on desktop) */}
      <section id="resume-analyzer" className="flex flex-col justify-center items-center min-h-[calc(100vh-4rem)] px-6 pt-20">
        <div className="text-center max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-semibold text-blue-800 animate-fadeIn">
            “Analyze resumes smarter — hire the best, faster.”
          </h2>
          <p className="text-gray-600 mt-2 animate-fadeIn delay-200">
            ResReview empowers HRs to evaluate candidate resumes efficiently and objectively.
          </p>
        </div>

        {/* Resume Analyzer Section */}
        <div className="w-full max-w-6xl mt-10">
          <ResumeAnalyzer onAnalysisComplete={handleAnalysisComplete} />
        </div>
      </section>

      {/* Uploaded Resumes Section */}
      <section id="resumes-table" className="max-w-6xl mx-auto py-16 px-6">
        <h3 className="text-2xl font-bold text-blue-800 text-center mb-6">
          Your Analyzed Resumes
        </h3>
        <ResumesTable refreshTrigger={refreshTrigger} />
      </section>
    </div>
  );
}
