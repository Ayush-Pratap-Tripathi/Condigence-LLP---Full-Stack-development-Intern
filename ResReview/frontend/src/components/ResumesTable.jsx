import React, { useEffect, useState } from "react";
import { getUserResumes } from "../services/api";

function extractEmail(text = "") {
  const emailRegex = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;
  const m = text.match(emailRegex);
  return m ? m[0] : "";
}

function extractPhone(text = "") {
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{2,4}\)?[-.\s]?)?[\d\-.\s]{6,15}\d/g;
  const matches = text.match(phoneRegex);
  if (!matches) return "";
  for (let m of matches) {
    const digits = m.replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) return m.trim();
  }
  return matches[0].trim();
}

function extractName(text = "") {
  if (!text) return "";
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  for (let line of lines.slice(0, 12)) {
    const m = line.match(/^(?:Name|Full Name|Candidate Name)\s*[:\-]\s*(.+)$/i);
    if (m && m[1]) return m[1].trim();
  }
  for (let line of lines.slice(0, 6)) {
    if (/[A-Za-z]/.test(line) && !/@/.test(line) && !/\d/.test(line)) {
      const wordCount = line.split(/\s+/).length;
      if (wordCount >= 2 && wordCount <= 4 && line.length < 40) return line;
    }
  }
  for (let line of lines.slice(0, 6)) {
    if (/^[A-Z\s]{3,40}$/.test(line) && !line.includes("RESUME") && !line.includes("CURRICULUM")) {
      return line.trim();
    }
  }
  return "";
}

function extractJobRole(jobDescription = "", text = "") {
  if (jobDescription && jobDescription.trim().length > 0) {
    const lines = jobDescription.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    for (let line of lines.slice(0, 6)) {
      const m = line.match(/^(?:Job Title|Role|Position)\s*[:\-]\s*(.+)$/i);
      if (m && m[1]) return m[1].trim();
    }
    return lines[0] ? lines[0].slice(0, 80) : "";
  }
  const t = text;
  const m1 = t.match(/(Objective|Career Objective|Seeking)\s*[:\-]?\s*(.+)/i);
  if (m1 && m1[2]) return m1[2].split(/[.|\n]/)[0].trim();
  return "";
}

export default function ResumesTable({ refreshTrigger }) {
  const [resumes, setResumes] = useState([]);
  const [allResumes, setAllResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterRole, setFilterRole] = useState("");

  const loadResumes = async () => {
    setLoading(true);
    try {
      const userRaw = localStorage.getItem("user");
      if (!userRaw) {
        setError("User not found in localStorage. Please login.");
        setLoading(false);
        return;
      }
      const user = JSON.parse(userRaw);
      const userId = user?.id;

      const data = await getUserResumes(userId);
      const arr = Array.isArray(data) ? data : [];

      const mapped = arr.map((r) => {
        const text = r.extractedText || "";
        const jobDesc = r.jobDescription || "";
        return {
          id: r.id || r._id,
          fileName: r.fileName || "",
          atsScore: r.atsScore || 0,
          matchPercentage: r.matchPercentage || 0,
          rating: r.rating || "",
          candidateName: r.candidateName || extractName(text),
          candidateEmail: r.candidateEmail || extractEmail(text),
          candidatePhone: r.candidatePhone || extractPhone(text),
          jobRole: r.jobRole || extractJobRole(jobDesc, text),
        };
      });

      mapped.sort((a, b) => (b.matchPercentage || 0) - (a.matchPercentage || 0));
      setResumes(mapped);
      setAllResumes(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to load resumes: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResumes();
  }, [refreshTrigger]);

  const handleFilter = () => {
    if (!filterRole.trim()) return;
    const filtered = allResumes.filter((r) =>
      r.jobRole?.toLowerCase().includes(filterRole.toLowerCase())
    );
    setResumes(filtered);
  };

  const handleShowAll = () => {
    setFilterRole("");
    setResumes(allResumes);
  };

  if (loading) return <div className="py-6 text-center">Loading resumes...</div>;
  if (error) return <div className="py-6 text-red-600 text-center">{error}</div>;

  const hasResumes = allResumes.length > 0;
  const noResults = hasResumes && resumes.length === 0;

  return (
    <div className="overflow-x-auto mt-6">
      {/* 🔍 Filter Controls (always visible) */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          placeholder="Filter by Job Role"
          className="p-2 border rounded-lg w-64 focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleFilter}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
        >
          Filter
        </button>
        <button
          onClick={handleShowAll}
          className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400 transition-all"
        >
          Show All
        </button>
      </div>

      {/* 📋 Conditional Table or Messages */}
      {!hasResumes ? (
        <div className="py-6 text-center text-gray-600">
          No resumes uploaded yet.
        </div>
      ) : noResults ? (
        <div className="py-6 text-center text-gray-600">
          No resumes match the selected job role.
        </div>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow-sm">
          <thead className="bg-blue-50">
            <tr>
              <th className="text-left p-3">S.No</th>
              <th className="text-left p-3">Candidate</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">Job Role</th>
              <th className="text-right p-3">ATS Score</th>
              <th className="text-right p-3">Match %</th>
              <th className="text-left p-3">Rating</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((r, idx) => (
              <tr
                key={r.id || idx}
                className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="p-3 align-top">{idx + 1}</td>
                <td className="p-3 align-top">
                  <div className="font-medium">
                    {r.candidateName || "Unknown"}
                  </div>
                  <div className="text-sm text-gray-500">{r.fileName}</div>
                </td>
                <td className="p-3 align-top">{r.candidatePhone || "-"}</td>
                <td className="p-3 align-top">{r.candidateEmail || "-"}</td>
                <td className="p-3 align-top">{r.jobRole || "-"}</td>
                <td className="p-3 align-top text-right">
                  {r.atsScore?.toFixed(1)}
                </td>
                <td className="p-3 align-top text-right">
                  {r.matchPercentage?.toFixed(1)}
                </td>
                <td className="p-3 align-top">{r.rating || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
