// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

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
      // show backend validation errors nicely
      if (err.response && err.response.data) {
        const data = err.response.data;
        // if object of field errors, display first one
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
    <div style={styles.container}>
      <h2>Create account</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={onChange}
          required
        />
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
        <input
          name="password2"
          type="password"
          placeholder="Confirm Password"
          value={form.password2}
          onChange={onChange}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
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

export default Signup;
