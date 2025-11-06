// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ATSSuggestions from "./pages/ATSSuggestions"; // ✅ newly added import
import Navbar from "./components/Navbar";

// ✅ Protected route logic stays same
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Default redirect to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Auth routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ New ATS Suggestions page route */}
        <Route
          path="/ats-suggestions"
          element={
            <ProtectedRoute>
              <ATSSuggestions />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
