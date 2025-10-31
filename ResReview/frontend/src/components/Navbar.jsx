// src/components/Navbar.jsx
import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

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

  // hide navbar on login/register pages
  if (location.pathname === "/login" || location.pathname === "/register") {
    return null;
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/dashboard" className="text-xl font-bold text-blue-600">
            ResReview
          </Link>

          {token && (
            <div className="flex items-center gap-3">
              <span className="text-gray-700 font-medium">
                {user?.username || user?.email || "User"}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm bg-white border border-blue-600 text-blue-600 px-3 py-1 rounded hover:bg-blue-50 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
