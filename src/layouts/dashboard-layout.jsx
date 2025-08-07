import React, { useState, useRef, useEffect } from "react";
import { Sidebar } from "../components/sidebar";
import { Menu } from "lucide-react";
import { useSelector } from "react-redux";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [, setShowNotifications] = useState(false);
  const [, setShowSettings] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const user = useSelector((state) => state.me.me);
  const notifRef = useRef(null);
  const settingsRef = useRef(null);
  const accountRef = useRef(null);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target))
        setShowNotifications(false);
      if (settingsRef.current && !settingsRef.current.contains(event.target))
        setShowSettings(false);
      if (accountRef.current && !accountRef.current.contains(event.target))
        setShowAccountMenu(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="dashboard-layout bg-white">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="dashboard-content">
        {isMobile && (
          <div className="bg-white border-b border-gray-200 p-4 lg:hidden">
            <button
              className="text-gray-500 hover:text-gray-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>

          <div className="flex items-center gap-4 relative">

            {/* ✅ User Avatar Dropdown */}
            <div ref={accountRef} className="relative">
              <button
                className="flex items-center space-x-2"
                onClick={() => {
                  setShowAccountMenu(!showAccountMenu);
                  setShowNotifications(false);
                  setShowSettings(false);
                }}
              >
                <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-semibold">
                  U
                </div>
                <span className="text-brown-700 font-medium">{user.given_name}</span>
              </button>
              {showAccountMenu && (
                <div className="absolute right-0 top-12 mt-2 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                  <div className="p-4 border-b font-semibold text-brown-700">My Account</div>
                  <ul className="divide-y divide-gray-100">
                    <li className="p-4 hover:bg-gray-50 cursor-pointer">Profile</li>
                    <li className="p-4 hover:bg-gray-50 cursor-pointer">Settings</li>
                    <li className="p-4 hover:bg-gray-50 cursor-pointer">Logout</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className="dashboard-main p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}