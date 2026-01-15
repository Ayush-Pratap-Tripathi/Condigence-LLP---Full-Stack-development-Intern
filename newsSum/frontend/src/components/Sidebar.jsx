// frontend/src/components/Sidebar.jsx
import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { FiSettings, FiMenu, FiMoreVertical } from "react-icons/fi";
import DummyProfile from "../constants/dummy_profile.svg";
import { ThemeContext } from "../contexts/ThemeContext";

const Sidebar = ({
  user = {},
  summaries = [],
  onOpenSummary,
  onDeleteSummary,
  onDownloadSummary,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [openMenuId, setOpenMenuId] = useState(null);

  const avatarSrc = (user && user.avatar) || DummyProfile;

  return (
    <motion.aside
      initial={{ width: 260 }}
      animate={{ width: collapsed ? 80 : 260 }}
      transition={{ type: "spring", stiffness: 240, damping: 26 }}
      className="h-screen bg-white border-r border-gray-100 flex flex-col"
    >
      {/* Header */}
      <div className="px-3 py-4 flex items-center gap-3">
        <button
          onClick={() => setCollapsed((s) => !s)}
          aria-label="Toggle sidebar"
          className="p-2 rounded hover:bg-gray-100 text-gray-600"
        >
          <FiMenu size={18} />
        </button>

        {!collapsed && (
          <div className="flex items-center gap-3">
            <img
              src={avatarSrc}
              alt="avatar"
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
            <div>
              <div className="font-medium text-gray-700 text-sm">
                {user?.username || "Anonymous"}
              </div>
              <div className="text-xs text-gray-500">{user?.email || ""}</div>
            </div>
          </div>
        )}

        {collapsed && (
          <div className="ml-auto">
            <img
              src={avatarSrc}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover border border-gray-200"
            />
          </div>
        )}
      </div>

      {/* Summaries */}
      <div
        className="flex-1 overflow-auto px-2 py-3"
        onScroll={() => setOpenMenuId(null)}
      >
        {!collapsed && (
          <div className="px-2 mb-2 text-xs uppercase text-gray-500 font-semibold">
            My Summaries
          </div>
        )}

        <div className={`space-y-2 ${openMenuId ? "pointer-events-none" : ""}`}>
          {summaries && summaries.length > 0 ? (
            summaries.map((s) => (
              <motion.div
                key={s._id}
                whileHover={openMenuId === s._id ? {} : { scale: 1.02 }}
                className={`relative flex items-center justify-between rounded-md p-2 cursor-pointer
                  ${
                    openMenuId === s._id
                      ? "z-50 bg-white pointer-events-auto"
                      : "hover:bg-gray-50 z-0"
                  }
                `}
              >
                <div
                  className="flex items-center gap-3"
                  onClick={() => onOpenSummary?.(s)}
                >
                  {!collapsed && (
                    <div className="text-sm text-gray-600 truncate">
                      {s.title.slice(0, 25) + "..."}
                    </div>
                  )}
                </div>

                {!collapsed && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === s._id ? null : s._id);
                      }}
                      className="p-1 rounded hover:bg-gray-100 text-gray-600"
                    >
                      <FiMoreVertical />
                    </button>

                    {openMenuId === s._id && (
                      <div
                        className="absolute right-0 mt-2 w-36 bg-white border border-gray-200
                                   rounded-md shadow-xl z-50 isolation-isolate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                          onClick={() => {
                            setOpenMenuId(null);
                            onOpenSummary?.(s);
                          }}
                        >
                          View
                        </button>

                        <button
                          className="w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDownloadSummary?.(s);
                          }}
                        >
                          Download
                        </button>

                        <button
                          className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setOpenMenuId(null);
                            onDeleteSummary?.(s);
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="px-3 py-6 text-center text-sm text-gray-400">
              {!collapsed
                ? "No summaries yet. Click 'Summarize' on any article to create one."
                : null}
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="px-3 py-3 border-t border-gray-100">
        <button
          onClick={() => setOpenSettings((v) => !v)}
          className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 w-full text-gray-600"
        >
          <FiSettings />
          <span className={`text-sm ${collapsed ? "hidden" : ""}`}>
            Settings
          </span>
        </button>

        <AnimatePresence>
          {openSettings && !collapsed && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mt-2 rounded bg-white shadow p-2"
            >
              <button
                className="w-full text-left px-3 py-2 rounded hover:bg-gray-50 text-gray-600"
                onClick={() => {
                  setOpenSettings(false);
                  navigate("/profile");
                }}
              >
                Profile Settings
              </button>

              <div className="flex items-center justify-between px-3 py-2 text-gray-600">
                <span>Theme</span>
                <button
                  aria-label="Toggle theme"
                  className={
                    "relative inline-flex items-center w-10 h-6 p-0.5 rounded-full " +
                    (theme === "dark" ? "bg-indigo-600" : "bg-gray-300")
                  }
                  onClick={toggleTheme}
                >
                  <span
                    className={
                      "transform transition-transform w-4 h-4 bg-white rounded-full shadow " +
                      (theme === "dark"
                        ? "translate-x-[1.25rem]"
                        : "translate-x-0")
                    }
                  />
                </button>
              </div>

              <button
                onClick={() => onLogout?.()}
                className="w-full text-left px-3 py-2 rounded hover:bg-red-50 text-red-600"
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
