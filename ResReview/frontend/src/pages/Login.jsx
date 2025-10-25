import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate(); // hook for navigation

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.token) {
        // Save token to localStorage
        localStorage.setItem("token", data.token);

        // ✅ If backend returns user info with token (like user id/email), store it
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }

        // Redirect to Dashboard
        navigate("/dashboard");
      } else {
        setMsg(data.error || "Invalid credentials");
      }
    } catch (err) {
      setMsg(err);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-center text-blue-700">Login</h2>

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md font-medium"
        >
          Login
        </button>

        <p className="text-center text-sm text-gray-600">{msg}</p>
      </form>
    </div>
  );
}
