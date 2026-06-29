"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  UserPlus,
  Boxes,
  FileText,
  LogOut,
} from "lucide-react";

import { cn } from "@/src/shared/lib/cn";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { appToast } from "@/src/shared/lib/toast";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

const menu = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  {
    name: "Student Enrollments",
    icon: UserPlus,
    path: "/enrollments",
  },
  {
    name: "Batches",
    icon: Boxes,
    path: "/batches",
  },
  {
    name: "Job Applications",
    icon: FileText,
    path: "/applications",
  },
];

export function BranchSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      appToast.success("Logged out successfully");
    } catch {
      appToast.error("Logout failed");
    } finally {
      setLogoutLoading(false);
      setLogoutOpen(false);
    }
  };

  return (
    <>
      <aside className="w-64 h-screen bg-gradient-to-b from-[#0A0F1D] to-[#070A13] text-slate-200 flex flex-col border-r border-slate-800/60 shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
        
        {/* BRAND LOGO HEADER */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-slate-800/70 bg-[#0A0F1D]/50 backdrop-blur-md">
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
            <Image
              src="/Logo/MCJ_logo.png"
              alt="logo"
              width={32}
              height={32}
              priority
              className="object-contain drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-tight text-white">
              MCJ Institute
            </h2>
            <p className="text-[10px] uppercase tracking-wider text-blue-400 font-semibold mt-0.5">
              Branch Panel
            </p>
          </div>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto px-3.5 py-6 space-y-1.5 custom-scrollbar">
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 px-3 mb-3 font-bold">
            Navigation
          </p>
          
          {menu.map((item) => {
            const Icon = item.icon;
            // Matches strict or child routes cleanly
            const isActive = pathname === item.path || pathname.startsWith(item.path + "/");

            return (
              <Link href={item.path} key={item.name} className="block">
                <div
                  className={cn(
                    "group flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm transition-all duration-200 cursor-pointer relative",
                    "hover:bg-slate-800/40 hover:translate-x-1",
                    isActive
                      ? "bg-gradient-to-r from-blue-500/15 to-indigo-500/5 text-blue-300 border border-blue-500/25 shadow-[0_0_16px_rgba(59,130,246,0.1)]"
                      : "text-slate-400 hover:text-slate-100"
                  )}
                >
                  {/* Subtle active indicator pill */}
                  {isActive && (
                    <span className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-blue-500 rounded-r-md" />
                  )}

                  <Icon
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      isActive && "text-blue-400 drop-shadow-[0_0_5px_rgba(59,130,246,0.6)]",
                      "group-hover:scale-110"
                    )}
                  />
                  <span className={cn("tracking-wide", isActive && "font-medium text-white")}>
                    {item.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        {/* CURRENT BRANCH CONTEXT FOOTER */}
        <div className="p-4 border-t border-slate-800/70 bg-gradient-to-t from-[#070A13] to-transparent">
          <div className="px-1.5 mb-2 flex items-center justify-between text-[11px] font-medium tracking-wide text-slate-500">
            <span>CURRENT BRANCH</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>

          <div className="truncate rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-sm px-3.5 py-2.5 text-xs font-mono text-slate-300 shadow-inner">
            {user?.branchId ? user.branchId.slice(0, 12) : "Branch ID Loading..."}
          </div>
        </div>

        {/* LOGOUT BUTTON CONTAINER */}
        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center gap-3.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3.5 py-3 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium tracking-wide">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* SECURE SIGN-OUT CONFIRMATION DIALOG */}
      <ConfirmDialog
        open={logoutOpen}
        title="Sign Out"
        description="Are you sure you want to sign out from the branch platform?"
        loading={logoutLoading}
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}