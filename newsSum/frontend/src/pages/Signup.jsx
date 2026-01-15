// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import logo from "../constants/logo.svg";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.post("/signup/", {
        username: form.username,
        email: form.email,
        password: form.password,
        password2: form.password2,
      });
      toast.success("User created successfully. Login to continue.");
      navigate("/login");
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === "object") {
          const firstKey = Object.keys(data)[0];
          const msg = Array.isArray(data[firstKey])
            ? data[firstKey][0]
            : data[firstKey];
          toast.error(String(msg));
        } else {
          toast.error("Signup failed");
        }
      } else {
        toast.error("Network error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,rgba(79,70,229,0.25),transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md rounded-2xl border border-slate-200/60 dark:border-white/10
                   bg-white/80 dark:bg-white/5 backdrop-blur-xl
                   shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] p-8"
      >
        {/* Logo + Tagline */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 w-fit rounded-xl bg-gradient-to-br from-rose-500 to-indigo-500 p-3 shadow-lg">
            <img
              src={logo}
              alt="NewsSum logo"
              className="h-10 w-auto select-none"
            />
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Join NewsSum and stay informed faster.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Username
            </label>
            <input
              name="username"
              value={form.username}
              onChange={onChange}
              placeholder="Your username"
              required
              className="w-full rounded-lg px-4 py-2.5
                         bg-white dark:bg-white/10
                         text-slate-900 dark:text-white
                         placeholder-slate-400 dark:placeholder-slate-500
                         border border-slate-300/60 dark:border-white/15
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
                         outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email address
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
              className="w-full rounded-lg px-4 py-2.5
                         bg-white dark:bg-white/10
                         text-slate-900 dark:text-white
                         placeholder-slate-400 dark:placeholder-slate-500
                         border border-slate-300/60 dark:border-white/15
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
                         outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              required
              className="w-full rounded-lg px-4 py-2.5
                         bg-white dark:bg-white/10
                         text-slate-900 dark:text-white
                         placeholder-slate-400 dark:placeholder-slate-500
                         border border-slate-300/60 dark:border-white/15
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
                         outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Confirm password
            </label>
            <input
              name="password2"
              type="password"
              value={form.password2}
              onChange={onChange}
              placeholder="••••••••"
              required
              className="w-full rounded-lg px-4 py-2.5
                         bg-white dark:bg-white/10
                         text-slate-900 dark:text-white
                         placeholder-slate-400 dark:placeholder-slate-500
                         border border-slate-300/60 dark:border-white/15
                         focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30
                         outline-none transition"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-lg py-2.5 font-medium text-white
                       bg-gradient-to-r from-indigo-500 to-indigo-600
                       hover:from-indigo-600 hover:to-indigo-700
                       shadow-lg shadow-indigo-500/25
                       transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Sign Up"}
          </motion.button>
        </form>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
