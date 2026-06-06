"use client";

import { useEffect, useState } from "react";

import {
  LogOut,
  Settings,
} from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";

import { Avatar } from "@/src/shared/components/ui/avatar";

import { useAuth } from "@/src/features/auth/hooks/use-auth";

import { appToast } from "@/src/shared/lib/toast";

export function AdminHeader() {
  const [time, setTime] = useState("");

  const [date, setDate] = useState("");

  const {
    user,
    logout,
  } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formattedTime =
        now.toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );

      const formattedDate =
        now.toLocaleDateString(
          "en-IN",
          {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          }
        );

      setTime(formattedTime);

      setDate(formattedDate);
    };

    updateTime();

    const interval =
      setInterval(
        updateTime,
        60000
      );

    return () =>
      clearInterval(
        interval
      );
  }, []);

  const handleLogout =
    async (): Promise<void> => {
      try {
        await logout();

        appToast.success(
          "Logged out successfully"
        );
      } catch {
        appToast.error(
          "Logout failed"
        );
      }
    };

  const userName =
    user
      ? `${user.firstName} ${user.lastName}`
      : "Branch User";

  const avatarLetter =
    user?.firstName?.charAt(
      0
    ) ?? "B";

return (
  <header className="flex h-16 items-center justify-between border-b border-gray-100 bg-white px-6">
    {/* LEFT */}
    <div className="flex min-w-0 items-center gap-4">
      <div className="w-[300px]">
        <Input
          placeholder="Search..."
          className="h-10"
        />
      </div>

      <div className="flex h-10 items-center gap-2 rounded-lg bg-slate-100 px-3">
        <span className="text-xs font-medium text-slate-500">
          Branch
        </span>

        <span className="max-w-[140px] truncate text-sm font-semibold text-slate-800">
          {user?.branchId ?? "-"}
        </span>
      </div>
    </div>

    {/* RIGHT */}
    <div className="flex items-center gap-4">
      {/* DATE + TIME */}
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-900">
          {time}
        </p>

        <p className="text-xs text-slate-500">
          {date}
        </p>
      </div>

      {/* SETTINGS */}
      <button className="rounded-lg p-2 transition hover:bg-slate-100">
        <Settings className="h-5 w-5 text-slate-600" />
      </button>

      {/* USER */}
      <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
        <Avatar
          alt={userName}
          fallback={avatarLetter}
        />

        <div className="max-w-[180px]">
          <p className="truncate text-sm font-semibold text-slate-900">
            {userName}
          </p>

          <p className="truncate text-xs text-slate-500">
            {user?.email ?? "-"}
          </p>

          <p className="truncate text-xs font-medium text-[#2447A8]">
            {user?.role ?? "-"}
          </p>
        </div>
      </div>

      {/* LOGOUT */}
      <button
        onClick={handleLogout}
        className="flex h-10 items-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-medium text-red-600 transition hover:bg-red-50"
      >
        <LogOut className="h-4 w-4" />

        <span className="hidden xl:block">
          Logout
        </span>
      </button>
    </div>
  </header>

  );
}