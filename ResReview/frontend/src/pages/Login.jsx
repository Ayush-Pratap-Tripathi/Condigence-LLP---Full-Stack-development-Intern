// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";

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
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white animate-fadeIn">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6 transform transition-all duration-500 hover:scale-[1.01]"
      >
        <h2 className="text-2xl font-semibold text-center text-blue-700">Login</h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all font-medium shadow-md"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-black hover:text-blue-600 transition-colors"
          >
            Register
          </Link>
        </div>

        {msg && <p className="text-center text-sm text-red-600 mt-2">{msg}</p>}
      </form>
    </div>
  );
}
