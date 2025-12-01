// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiSave,
  FiTrash2,
  FiLogOut,
  FiUpload,
  FiX,
  FiEdit3,
  FiArrowLeft,
  FiCheck,
} from "react-icons/fi";

// Avatar Component with better layout
function Avatar({ avatar, onFileSelected, onRemove, loading }) {
  const fileRef = useRef();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }
      onFileSelected(file);
    }
  };

  const handleClickSelect = () => fileRef.current?.click();

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileChange({ target: { files: [file] } });
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
        className={`
          relative w-32 h-32 rounded-full border-4 border-white shadow-lg
          ${
            isDragging
              ? "border-primary ring-4 ring-primary/20"
              : "border-gray-200"
          }
          transition-all duration-200 group
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {avatar ? (
          <img
            src={avatarUrl}
            alt="avatar"
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <FiUser className="w-12 h-12 text-gray-400" />
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
            />
          </div>
        )}

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClickSelect}
          className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white"
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
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClickSelect}
          className="px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full flex items-center gap-1 transition-colors"
          disabled={loading}
        >
          <FiUpload className="w-3 h-3" />
          Change
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onRemove}
          className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-full flex items-center gap-1 transition-colors"
          disabled={!avatar || loading}
        >
          <FiX className="w-3 h-3" />
          Remove
        </motion.button>
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

  // Form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  // Fetch profile on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    api
      .get("/profile/")
      .then((res) => {
        if (!isMounted) return;
        setProfile(res.data);
        setFirstName(res.data.first_name || "");
        setLastName(res.data.last_name || "");
        setUsername(res.data.username || "");
        setEmail(res.data.email || "");
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
        if (err?.response?.status === 401) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          navigate("/login");
          toast.error("Please login again");
        } else {
          toast.error("Failed to load profile");
        }
      })
      .finally(() => setLoading(false));

    return () => (isMounted = false);
  }, [navigate]);

  const applyProfileUpdate = (data) => {
    setProfile(data);
    setFirstName(data.first_name || "");
    setLastName(data.last_name || "");
    setUsername(data.username || "");
    setEmail(data.email || "");
    setErrors({});
    setPreviewAvatar(null);
  };

  const handleSaveBasic = async (e) => {
    e?.preventDefault();
    setSaving(true);
    setErrors({});

    try {
      const res = await api.patch("/profile/", {
        first_name: firstName,
        last_name: lastName,
        username,
        email,
      });
      applyProfileUpdate(res.data);
      toast.success("Profile updated successfully!");
    } catch (err) {
      if (err.response?.data) {
        setErrors(err.response.data);
        toast.error("Please fix the errors below");
      } else {
        console.error(err);
        toast.error("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarFile = async (file) => {
    const url = URL.createObjectURL(file);
    setPreviewAvatar(url);
    setAvatarLoading(true);

    const fd = new FormData();
    fd.append("avatar", file);

    try {
      const res = await api.patch("/profile/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      applyProfileUpdate(res.data);
      URL.revokeObjectURL(url);
      toast.success("Profile picture updated!");
    } catch (err) {
      console.error("Avatar upload failed", err);
      if (err.response?.data) setErrors(err.response.data);
      toast.error("Failed to upload profile picture");
    } finally {
      setAvatarLoading(false);
      setPreviewAvatar(null);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!profile?.avatar) return;

    if (!window.confirm("Remove profile picture?")) return;
    setAvatarLoading(true);

    try {
      const fd = new FormData();
      fd.append("remove_avatar", "true");
      const res = await api.patch("/profile/", fd);
      applyProfileUpdate(res.data);
      toast.success("Profile picture removed");
    } catch (err) {
      console.error(err);
      toast.error("Failed to remove profile picture");
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (
      !window.confirm(
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost."
      )
    )
      return;

    try {
      await api.delete("/profile/");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      toast.info("Account deleted successfully");
      navigate("/signup");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete account");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    toast.info("Logged out successfully");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            Unable to load your profile data.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Back Button */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Profile Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your account information and preferences
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-white rounded-lg transition-all duration-200"
          >
            <FiArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </motion.button>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Column - Avatar & Info - Now 1/4 width */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-1 space-y-6"
          >
            {/* Avatar Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <Avatar
                avatar={previewAvatar || profile.avatar}
                onFileSelected={handleAvatarFile}
                onRemove={handleRemoveAvatar}
                loading={avatarLoading}
              />
            </div>

            {/* Account Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiUser className="w-4 h-4 text-gray-500" />
                Account Information
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Username
                  </p>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-3 py-2 rounded-lg break-all">
                    {profile.username}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Email
                  </p>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg break-all">
                    {profile.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                    Member Since
                  </p>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                    {new Date(profile.date_joined).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions Card - Always visible without scrolling */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Actions</h3>

              <div className="space-y-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDeleteAccount}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  Delete Account
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Form - Now 3/4 width */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="xl:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <FiEdit3 className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-gray-900">
                  Edit Profile
                </h2>
              </div>

              <form onSubmit={handleSaveBasic} className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`
                        w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors
                        ${
                          errors.first_name
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                      `}
                    />
                    <AnimatePresence>
                      {errors.first_name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.first_name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`
                        w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors
                        ${
                          errors.last_name
                            ? "border-red-500"
                            : "border-gray-300"
                        }
                      `}
                    />
                    <AnimatePresence>
                      {errors.last_name && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-1 text-sm text-red-600"
                        >
                          {errors.last_name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`
                      w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors
                      ${errors.username ? "border-red-500" : "border-gray-300"}
                    `}
                  />
                  <AnimatePresence>
                    {errors.username && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.username}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`
                      w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors
                      ${errors.email ? "border-red-500" : "border-gray-300"}
                    `}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-1 text-sm text-red-600"
                      >
                        {errors.email}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Save Button - Fixed contrast */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={{ scale: saving ? 1 : 1.02 }}
                    whileTap={{ scale: saving ? 1 : 0.98 }}
                    className={`
                      flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors
                      ${
                        saving
                          ? "bg-gray cursor-not-allowed text-black"
                          : "bg-primary hover:bg-primary/90 text-black shadow-md hover:shadow-lg"
                      }
                    `}
                  >
                    {saving ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FiCheck className="w-4 h-4" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
