"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, Search, Clock, Calendar, Building2 } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { appToast } from "@/src/shared/lib/toast";

export function AdminHeader() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  const { user, logout } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formattedTime = now.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
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

  const handleLogout = async (): Promise<void> => {
    try {
      await logout();
      appToast.success("Logged out successfully");
    } catch {
      appToast.error("Logout failed");
    }
  };

  const userName = user ? `${user.firstName} ${user.lastName}` : "Branch Manager";
  const avatarLetter = user?.firstName?.charAt(0) ?? "K";

  return (
    <header className="flex h-20 items-center justify-between border-b border-slate-200/60 bg-white/80 px-8 backdrop-blur-md sticky top-0 z-40">
      {/* LEFT SECTION */}
      <div className="flex min-w-0 flex-1 items-center gap-6">
        {/* Search Input with integrated icon */}
        <div className="relative w-full max-w-md group">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-indigo-500" />
          <Input
            placeholder="Search dashboard, features, or logs..."
            className="h-11 w-full pl-10 pr-4 bg-slate-50/60 border-slate-200/80 rounded-xl transition-all duration-200 focus-visible:bg-white focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:border-indigo-500 text-sm"
          />
        </div>

        {/* Branch Identifier badge */}
        <div className="flex h-9 items-center gap-2 rounded-xl bg-indigo-50/60 border border-indigo-100/40 px-3.5 shadow-sm">
          <Building2 className="h-3.5 w-3.5 text-indigo-500" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-400">
            Branch
          </span>
          <span className="max-w-[150px] truncate text-xs font-mono font-semibold text-indigo-950">
            {user?.branchId ?? "99c56d52-f20f-4be..."}
          </span>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-6">
        {/* Live Date & Time Container */}
        <div className="flex items-center gap-3 border-r border-slate-100 pr-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
            <Clock className="h-4 w-4 text-slate-500" />
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-900 tabular-nums leading-none mb-0.5">
              {time || "01:31 pm"}
            </p>
            <p className="text-[11px] font-medium text-slate-400 tracking-wide">
              {date || "Mon, 29 Jun, 2026"}
            </p>
          </div>
        </div>

        {/* Action Button: Settings */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 text-slate-500 transition-all duration-200 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300">
          <Settings className="h-4 w-4 transition-transform duration-300 hover:rotate-45" />
        </button>

        {/* HOVER INTERACTIVE PROFILE AREA */}
        <div className="relative group border-l border-slate-100 pl-5 py-2">
          {/* Main Display Entrypoint */}
          <div className="flex cursor-pointer items-center gap-3 rounded-xl p-1 pr-2 transition-all duration-200 hover:bg-slate-50">
            <div className="relative">
              <Avatar
                alt={userName}
                fallback={avatarLetter}
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>

            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-slate-800 leading-none mb-1">
                {userName}
              </p>
              <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-600">
                {user?.role ?? "BRANCH_MANAGER"}
              </p>
            </div>
          </div>

          {/* Smooth Dropdown Card visible on Hover */}
          <div className="absolute right-0 top-full mt-1 w-64 origin-top-right rounded-2xl border border-slate-200/70 bg-white p-4 shadow-xl shadow-slate-200/50 opacity-0 scale-95 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto z-50">
            <div className="border-b border-slate-100 pb-3 mb-3">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Signed in as</p>
              <p className="truncate text-sm font-bold text-slate-800">{userName}</p>
              <p className="truncate text-xs font-medium text-slate-500 mt-0.5">{user?.email ?? "kengeri@gmail.com"}</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-between rounded-xl bg-rose-50/50 px-3 py-2.5 text-sm font-semibold text-rose-600 border border-rose-100/40 transition-all duration-200 hover:bg-rose-600 hover:text-white hover:border-transparent group/btn"
            >
              <span className="tracking-wide">Sign Out Platform</span>
              <LogOut className="h-4 w-4 transition-transform duration-200 group-hover/btn:translate-x-0.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}