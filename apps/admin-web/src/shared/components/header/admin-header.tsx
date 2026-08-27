"use client";

import Link from "next/link";
import { Input } from "@/src/shared/components/ui/input";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { useEffect, useState, useRef } from "react";
import { Settings, LogOut, ChevronDown, Bell } from "lucide-react";
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
    <header className="flex h-[72px] shrink-0 items-center justify-between rounded-b-2xl border-b border-[#DCE8F5] bg-white px-8">
      <div className="min-w-0 w-full max-w-[420px]">
        <Input
          placeholder="Search analytics, students or courses..."
          className="h-[46px] rounded-xl border-[#DCE8F5] bg-[#FBFDFF] placeholder:text-[#8AA0BB] shadow-[0_1px_6px_rgba(16,42,86,0.04)]"
        />
      </div>

      <div className="flex items-center gap-5">
        <div className="text-sm font-medium text-[#102A56]">{time}</div>
        <div className="text-sm text-[#647A9B]">{date}</div>

        <button
          type="button"
          className="text-[#2563EB] transition-colors hover:text-[#102A56]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={1.75} />
        </button>

        <Link
          href="/settings"
          className="text-[#2563EB] transition-colors hover:text-[#102A56]"
          aria-label="Settings"
        >
          <Settings className="h-5 w-5" strokeWidth={1.75} />
        </Link>

        <div
          className="relative cursor-pointer"
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <div className="flex items-center gap-2">
            <Avatar alt={user?.name ?? "Admin"} fallback={initials} />
            <ChevronDown className="h-4 w-4 text-[#647A9B]" />
          </div>

          {dropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 z-50 mt-2 w-52 rounded-2xl border border-[#DCE8F5] bg-white py-2 shadow-[0_8px_24px_rgba(16,42,86,0.08)]"
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="border-b border-[#DCE8F5] px-4 py-2">
                <p className="text-sm font-medium text-[#102A56]">
                  {user?.name ?? "Admin"}
                </p>
                <p className="text-xs text-[#647A9B]">{user?.email ?? ""}</p>
              </div>

              <Link
                href="/settings"
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-[#102A56] transition-colors hover:bg-[#F4F9FF]"
              >
                <Settings className="h-4 w-4 text-[#2563EB]" />
                Security settings
              </Link>

              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-rose-600 transition-colors hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
