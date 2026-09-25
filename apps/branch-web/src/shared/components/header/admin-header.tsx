"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, LogOut, Settings } from "lucide-react";

import { Avatar } from "@/src/shared/components/ui/avatar";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { appToast } from "@/src/shared/lib/toast";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { cn } from "@/src/shared/lib/cn";
import { BranchGlobalSearch } from "@/src/shared/components/header/branch-global-search";

const iconActionClass = cn(
  "flex h-10 w-10 items-center justify-center rounded-lg",
  "bg-transparent text-[#2563EB]",
  "transition-colors hover:bg-[#2563EB]/8 hover:text-[#102A56]",
);

export function AdminHeader() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { logout, user } = useAuth();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
      setDate(
        now.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      appToast.success("Logged out successfully");
    } catch {
      appToast.error("Logout failed");
    }
  };

  const displayName = user
    ? `${user.firstName} ${user.lastName ?? ""}`.trim() || "Branch User"
    : "Branch User";
  const roleLabel = formatRoleLabel(user?.role) || "Branch Portal";
  const canOpenSettings = user?.role === "BRANCH_MANAGER";

  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header
      className={cn(
        "relative shrink-0 border-b border-[#DCE8F5]",
        "bg-gradient-to-r from-white via-[#FBFDFF] to-[#F0F7FF]",
        "shadow-[0_4px_20px_rgba(16,42,86,0.05)]",
        "px-4 py-3 md:px-6 lg:px-8",
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/20 to-transparent" />

      <div className="flex min-h-[60px] flex-wrap items-center gap-x-4 gap-y-3 lg:min-h-[64px] lg:gap-4">
        <div className="min-w-0 shrink-0 basis-full sm:basis-auto lg:max-w-[280px] xl:max-w-xs">
          <p className="truncate text-sm font-semibold text-[#102A56]">
            Welcome back, {displayName}
          </p>
          <p className="truncate text-xs text-[#647A9B]">
            Manage your branch from one place
          </p>
        </div>

        <BranchGlobalSearch className="min-w-0 flex-1 basis-full sm:basis-0 sm:min-w-[220px] lg:max-w-xl" />

        <div className="ml-auto flex shrink-0 basis-full items-center justify-end gap-2 sm:basis-auto sm:gap-3">
          <span className="text-[10px] tabular-nums text-[#647A9B] sm:hidden">
            {time ? `${time} · ${date}` : null}
          </span>

          <div
            className={cn(
              "hidden flex-col rounded-xl border border-[#E8F1FF] bg-white/80 px-3 py-1.5 text-right",
              "shadow-[0_1px_4px_rgba(16,42,86,0.04)] sm:flex",
            )}
          >
            <span className="text-xs font-semibold tabular-nums text-[#102A56]">
              {time}
            </span>
            <span className="text-[10px] leading-tight text-[#647A9B]">
              {date}
            </span>
          </div>

          <button
            type="button"
            className={iconActionClass}
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
          </button>

          {canOpenSettings ? (
            <Link
              href="/settings"
              className={iconActionClass}
              aria-label="Settings"
            >
              <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />
            </Link>
          ) : null}

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen((open) => !open)}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E8F1FF]",
                "bg-white/90 py-1 pl-1 pr-2 shadow-[0_1px_4px_rgba(16,42,86,0.04)]",
                "transition-colors hover:border-[#2563EB]/25 hover:bg-[#F4F9FF]",
              )}
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
            >
              <Avatar alt={displayName} fallback={initials} />
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 text-[#647A9B] transition-transform",
                  dropdownOpen && "rotate-180",
                )}
              />
            </button>

            {dropdownOpen ? (
              <div
                className={cn(
                  "absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl",
                  "border border-[#DCE8F5] bg-white",
                  "shadow-[0_12px_40px_rgba(16,42,86,0.12)]",
                )}
              >
                <div className="border-b border-[#E8F1FF] bg-gradient-to-br from-[#F8FBFF] to-white px-4 py-3">
                  <p className="truncate text-sm font-semibold text-[#102A56]">
                    {displayName}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-[#647A9B]">
                    {user?.email ?? ""}
                  </p>
                  <p className="mt-1.5 inline-flex rounded-md bg-[#E8F1FF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2563EB]">
                    {roleLabel}
                  </p>
                </div>

                <div className="p-1.5">
                  {canOpenSettings ? (
                    <Link
                      href="/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-[#102A56] transition-colors hover:bg-[#F4F9FF]"
                    >
                      <Settings className="h-4 w-4 text-[#2563EB]" />
                      Settings
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
