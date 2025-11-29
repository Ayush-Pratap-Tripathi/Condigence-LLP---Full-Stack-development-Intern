// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/login/", {
        email: form.email,
        password: form.password,
      });
      const { access, refresh, user } = res.data;
      // store tokens in localStorage (simple approach)
      localStorage.setItem("accessToken", access);
      localStorage.setItem("refreshToken", refresh);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Logged in successfully");
      navigate("/dashboard");
    } catch (err) {
      if (err.response && err.response.data) {
        const data = err.response.data;
        const msg =
          data.detail ||
          (data.non_field_errors && data.non_field_errors[0]) ||
          JSON.stringify(data);
        toast.error(String(msg));
      } else {
        toast.error("Network error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={onChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p>
        Don’t have an account? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 420,
    margin: "60px auto",
    padding: 20,
    textAlign: "center",
  },
  form: { display: "flex", flexDirection: "column", gap: 10 },
};

export default Login;
