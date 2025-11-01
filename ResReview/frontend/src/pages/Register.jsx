// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await registerUser(form);
      // handle plain-string or object responses
      const message =
        typeof data === "string"
          ? data
          : data?.message || "Registration complete";

      alert(message); // show success
      navigate("/login"); // redirect
    } catch (err) {
      console.error(err);
      const msg =
        err?.response?.data?.message || err?.message || "Registration failed";
      alert(msg); // show error
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-white animate-fadeIn">
      <form
        onSubmit={handleRegister}
        className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6 transform transition-all duration-500 hover:scale-[1.01]"
      >
        <h2 className="text-2xl font-semibold text-center text-blue-700">
          Register
        </h2>

        <input
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Username"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />

        <input
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />

        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          required
        />

        <button
          type="submit"
          className="w-full border border-gray-300 text-black py-3 rounded-lg hover:bg-blue-50 transition-all font-medium shadow-sm"
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-white bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 transition-all"
          >
            Login
          </Link>
        </div>

        {msg && <p className="text-center text-sm text-gray-600 mt-2">{msg}</p>}
      </form>
    </div>
  );
}
