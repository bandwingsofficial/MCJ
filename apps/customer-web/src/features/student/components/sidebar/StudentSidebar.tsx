"use client";

import {
  LayoutDashboard,
  User,
} from "lucide-react";

import { StudentSidebarItem } from "./StudentSidebarItem";

export function StudentSidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-100 bg-white select-none">
      {/* Header Section */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <h2 className="text-sm font-bold text-slate-900 tracking-wider uppercase">
          Student Panel
        </h2>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1 p-3 mt-2">
        <div className="px-3 mb-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Core
          </p>
        </div>

        <StudentSidebarItem
          href="/student"
          icon={LayoutDashboard}
          label="Dashboard"
        />

        <StudentSidebarItem
          href="/student/profile"
          icon={User}
          label="Profile"
        />
      </nav>

      {/* Bottom Footer Accent */}
      <div className="p-4 border-t border-slate-50 bg-slate-50/40 flex items-center justify-between">
        <span className="text-[11px] text-slate-400 font-medium tracking-wide">Version 1.0.0</span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/20" />
      </div>
    </aside>
  );
}