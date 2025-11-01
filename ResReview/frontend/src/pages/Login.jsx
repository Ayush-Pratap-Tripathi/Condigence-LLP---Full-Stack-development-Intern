// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import logo from "../assets/logo.svg";
import depictable from "../assets/Depictable.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      if (data?.token) {
        localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setMsg(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setMsg(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-blue-100 relative overflow-hidden">
      {/* Soft gradient shapes */}
      <div className="absolute w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-30 -top-10 -left-10 animate-pulse"></div>
      <div className="absolute w-80 h-80 bg-blue-300 rounded-full blur-3xl opacity-20 bottom-10 right-10 animate-pulse"></div>

      <div className="flex flex-col md:flex-row items-center justify-between w-[90%] md:w-[80%] lg:w-[70%] xl:w-[60%] bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl p-10 transform transition-all duration-700 hover:shadow-blue-300/50 hover:scale-[1.01] animate-fadeIn">
        {/* Left Section (Form) */}
        <div className="w-full md:w-1/2 flex flex-col items-center space-y-6">
          {/* Logo */}
          <img
            src={logo}
            alt="ResReview Logo"
            className="w-16 h-16 mb-2 animate-float"
          />

          {/* Welcome Text */}
          <h2 className="text-3xl font-bold text-blue-700 text-center">
            Welcome Back
          </h2>
          <p className="text-center text-gray-600 text-sm max-w-sm">
            Empower your hiring decisions with <span className="text-blue-700 font-semibold">ResReview</span> — 
            where resumes meet intelligence.
          </p>

          {/* Form */}
          <form
            onSubmit={handleLogin}
            className="w-full space-y-4 mt-4"
          >
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full px-4 py-3 bg-white/70 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-800 transition-all"
              required
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-white/70 border border-blue-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 text-gray-800 transition-all"
              required
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-blue-700 hover:text-blue-800 transition-colors"
              >
                Register
              </Link>
            </div>

            {msg && (
              <p className="text-center text-sm text-red-600 mt-2 animate-fadeIn">
                {msg}
              </p>
            )}
          </form>
        </div>

        {/* Right Section (Illustration) */}
        <div className="hidden md:flex w-1/2 justify-center items-center">
          <img
            src={depictable}
            alt="Resume Illustration"
            className="w-4/5 max-w-sm drop-shadow-2xl animate-slideInRight"
          />
        </div>
      </div>
    </div>
  );
}
