import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // ✅ For navigation

const Dashboard = ({ onLogout }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const navigate = useNavigate(); // ✅ Initialize navigate

  // 🧠 Get token from localStorage (stored after login)
  const token = localStorage.getItem("token");

  // 📄 Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "application/pdf") {
      setMessage("Only PDF files are allowed!");
      setFile(null);
    } else {
      setMessage("");
      setFile(selectedFile);
    }
  };

  // 📤 Handle file upload
  const handleUpload = async () => {
    if (!file || !jobDescription) {
      setMessage("Please provide job description and PDF file.");
      return;
    }

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/resumes/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`, // ✅ Token sent to backend
          },
        }
      );
      setMessage("✅ Resume uploaded successfully!");
    } catch (err) {
      console.error("Upload failed:", err);
      setMessage("❌ Upload failed: " + (err.response?.data || err.message));
    }
  };

  // 🚪 Handle logout properly
  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ 1. Remove token
    if (onLogout) onLogout();         // ✅ 2. Call parent callback (optional)
    navigate("/login");               // ✅ 3. Redirect to login page
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-gray-800 font-sans">
      <div className="bg-white shadow-lg rounded-2xl p-10 w-full max-w-md border border-blue-100">
        <h2 className="text-3xl font-semibold text-center text-blue-700 mb-6">
          Dashboard
        </h2>

        <button
          onClick={handleLogout}
          className="absolute top-6 right-8 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md transition-all duration-200"
        >
          Logout
        </button>

        <div className="mb-5">
          <input
            type="text"
            placeholder="Enter Job Description"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full border border-blue-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="mb-5">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="w-full text-gray-700 border border-blue-300 bg-blue-50 rounded-lg p-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={handleUpload}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-all duration-200 shadow-md"
        >
          Upload Resume
        </button>

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
      </div>
    </div>
  );
};

export default Dashboard;
