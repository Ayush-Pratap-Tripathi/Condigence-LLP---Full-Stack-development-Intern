// src/pages/Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    toast.info("Logged out");
    navigate("/login");
  };

  return (
    <div style={{ maxWidth: 800, margin: "60px auto", padding: 20 }}>
      <h2>Dashboard</h2>
      <p>Logged in successfully{user ? ` — Welcome, ${user.username}` : ""}.</p>
      <button onClick={handleLogout}>Logout</button>
      {/* blank area for future content */}
    </div>
  );
};

export default Dashboard;
