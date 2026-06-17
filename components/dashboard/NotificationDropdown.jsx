"use client";

import React, { useState, useEffect, useRef } from "react";
import { BellIcon } from "@/components/icons/icons";
import { User, CreditCard } from "lucide-react";

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/admin/notifications", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const formatTimestamp = (ts) => {
    if (!ts) return "Just now";
    let date;
    if (ts?.toDate) {
      date = ts.toDate();
    } else if (typeof ts === "string") {
      date = new Date(ts);
    } else {
      date = new Date(ts);
    }
    
    if (isNaN(date.getTime())) return "Recently";
    
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${Math.max(1, diffMins)}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setOpen(!open)}
        className="relative bg-transparent border-0 cursor-pointer rounded-xl transition-all duration-300 hover:bg-gray-50 flex items-center justify-center p-2"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <BellIcon className="w-6 h-6" />
        {notifications.length > 0 && (
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden z-50">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {notifications.length > 0 && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                {notifications.length} New
              </span>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-gray-500">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">No new notifications</div>
            ) : (
              <ul className="divide-y divide-gray-50 m-0 p-0 list-none">
                {notifications.map((notif) => (
                  <li key={notif.id} className="p-4 hover:bg-gray-50 transition-colors flex gap-3 items-start">
                    <div className={`p-2 rounded-full mt-0.5 shrink-0 ${notif.type === 'subscription' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                      {notif.type === 'subscription' ? <CreditCard className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 mb-0.5">{notif.title}</p>
                      <p className="text-xs text-gray-500 mb-1">{notif.message}</p>
                      <p className="text-[10px] text-gray-400">{formatTimestamp(notif.timestamp)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
