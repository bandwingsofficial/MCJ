"use client";

import Link from "next/link";
import { Input } from "@/src/shared/components/ui/input";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { useEffect, useState, useRef } from "react";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { toast } from "sonner";

export function AdminHeader() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();

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

  const initials = (user?.name ?? "A")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm">
      <div className="w-[380px]">
        <Input
          placeholder="Search analytics, students or courses..."
          className="h-10"
        />
      </div>

      <div className="flex items-center gap-5">
        <div className="text-sm font-medium text-gray-800">{time}</div>
        <div className="text-sm text-gray-500">{date}</div>

        <Link
          href="/settings"
          className="text-gray-400 hover:text-gray-700 transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5" />
        </Link>

        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <div className="flex items-center gap-2">
            <Avatar alt={user?.name ?? "Admin"} fallback={initials} />
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </div>

          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-2 z-50"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-800">
                  {user?.name ?? "Admin"}
                </p>
                <p className="text-xs text-gray-500">{user?.email ?? ""}</p>
              </div>

              <Link
                href="/settings"
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Security settings
              </Link>

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
