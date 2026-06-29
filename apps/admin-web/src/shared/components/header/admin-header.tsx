"use client";

import { Input } from "@/src/shared/components/ui/input";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { useEffect, useState, useRef } from "react";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { toast } from "sonner";
import { cn } from "@/src/shared/lib/cn";

export function AdminHeader() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const formattedDate = now.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      setTime(formattedTime);
      setDate(formattedDate);
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to logout");
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      {/* LEFT: SEARCH */}
      <div className="w-[380px]">
        <Input
          placeholder="Search analytics, students or courses..."
          className="h-10"
        />
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-5">
        {/* TIME */}
        <div className="text-sm font-medium text-gray-800">{time}</div>

        {/* DATE */}
        <div className="text-sm text-gray-500">{date}</div>

        {/* SETTINGS ICON (optional) */}
        <button className="text-gray-400 hover:text-gray-700 transition-colors">
          <Settings className="w-5 h-5" />
        </button>

        {/* PROFILE / AVATAR WITH DROPDOWN */}
        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <div className="flex items-center gap-2">
            <Avatar alt="A" fallback="A" />
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">Admin</p>
                <p className="text-xs text-gray-500">admin@mcj.com</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}