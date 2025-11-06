// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  // ✅ Improved scroll/navigation logic
  const scrollToSection = (id) => {
    if (location.pathname === "/dashboard") {
      // If already on dashboard, scroll immediately
      const section = document.getElementById(id);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      // If on another page, navigate to dashboard first, then scroll
      navigate("/dashboard", { replace: false });

      // Wait briefly for dashboard to mount, then scroll
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) {
          section.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500); // delay ensures Dashboard is rendered
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl bg-white/30 border-b border-white/20 shadow-md rounded-b-3xl">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* 🔹 Left: Logo + Welcome */}
        <div className="flex items-center space-x-3">
          <Link
            to="/dashboard"
            className="flex items-center space-x-2 group cursor-pointer"
          >
            <img
              src={logo}
              alt="ResReview Logo"
              className="w-10 h-10 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
            />
          </Link>

          {token && (
            <h2 className="text-blue-700 text-sm sm:text-base font-semibold group cursor-default transition-all duration-300 hover:text-blue-900">
              Welcome,{" "}
              <span className="font-bold text-blue-900">
                {user?.username || user?.email?.split("@")[0] || "User"} 👋
              </span>
            </h2>
          )}
        </div>

        {/* 🔹 Center: Navigation Buttons */}
        <nav className="hidden sm:flex items-center space-x-10">
          <button
            onClick={() => scrollToSection("resume-analyzer")}
            className={`text-blue-800 font-medium transition-all duration-300 hover:text-blue-600 hover:scale-105 ${
              location.pathname === "/dashboard" ? "text-blue-900" : ""
            }`}
          >
            Analyze Resume
          </button>

          <button
            onClick={() => scrollToSection("resumes-table")}
            className="text-blue-800 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105"
          >
            See Rankings
          </button>

          <Link
            to="/ats-suggestions"
            className={`text-blue-800 font-medium hover:text-blue-600 transition-all duration-300 hover:scale-105 ${
              location.pathname === "/ats-suggestions"
                ? "text-blue-900 font-semibold underline decoration-blue-400"
                : ""
            }`}
          >
            ATS Suggestions
          </Link>
        </nav>

        {/* 🔹 Right: Logout Button */}
        {token && (
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-blue-600 to-blue-800 text-white px-5 py-2 rounded-xl shadow-md hover:shadow-blue-300/50 font-medium transition-all duration-300 hover:scale-105 hover:-translate-y-[1px] active:scale-95"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
