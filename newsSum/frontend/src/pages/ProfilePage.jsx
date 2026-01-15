// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FiUser,
  FiSave,
  FiTrash2,
  FiLogOut,
  FiUpload,
  FiX,
  FiEdit3,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";

function Avatar({ avatar, onFileSelected, onRemove, loading }) {
  const fileRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    onFileSelected(file);
  };

  const avatarUrl =
    avatar &&
    (avatar.startsWith("http") ? avatar : `${window.location.origin}${avatar}`);

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center space-y-4"
    >
      <div
        className={`relative w-32 h-32 rounded-full border-4 shadow-lg
          ${isDragging ? "border-primary" : "border-gray-200"}
        `}
      >
        {avatar ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
            <FiUser className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        )}

        <motion.button
          onClick={() => fileRef.current?.click()}
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-black rounded-full flex items-center justify-center shadow border-2 border-white"
          disabled={loading}
        >
          <FiUpload className="w-4 h-4" />
        </motion.button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full"
        >
          Change
        </button>

        <button
          onClick={onRemove}
          disabled={!avatar || loading}
          className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-full"
        >
          Remove
        </button>
      </div>
    </motion.div>
  );
}

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [previewAvatar, setPreviewAvatar] = useState(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    api
      .get("/profile/")
      .then((res) => {
        setProfile(res.data);
        setFirstName(res.data.first_name || "");
        setLastName(res.data.last_name || "");
        setUsername(res.data.username || "");
        setEmail(res.data.email || "");
      })
      .catch(() => toast.error("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-700">
              Profile Settings
            </h1>
            <p className="text-gray-500 mt-1">
              Manage your account information
            </p>
          </div>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
              <Avatar
                avatar={previewAvatar || profile.avatar}
                onFileSelected={() => {}}
                onRemove={() => {}}
                loading={avatarLoading}
              />
            </div>

            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-700 mb-4">
                Account Information
              </h3>

              <div className="space-y-3 text-sm text-gray-700">
                <div className="bg-gray-50 rounded px-3 py-2">
                  {profile.username}
                </div>
                <div className="bg-gray-50 rounded px-3 py-2">
                  {profile.email}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 space-y-3">
              <button
                onClick={() => {
                  localStorage.clear();
                  navigate("/login");
                }}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded"
              >
                Logout
              </button>

              <button
                onClick={() => {}}
                className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
              >
                Delete Account
              </button>
            </div>
          </div>

          <div className="xl:col-span-3">
            <div className="bg-white rounded-2xl shadow border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-6">
                Edit Profile
              </h2>

              <form className="space-y-6">
                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />

                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />

                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                />

                <input
                  className="w-full px-4 py-3 border border-gray-300 rounded text-gray-700"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email"
                />

                <div className="flex justify-end border-t border-gray-200 pt-4">
                  <button
                    disabled={saving}
                    className="px-6 py-3 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded shadow"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
