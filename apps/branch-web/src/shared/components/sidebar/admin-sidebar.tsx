"use client";

import Image from "next/image";
import { cn } from "@/src/shared/lib/cn";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  UserPlus,
  Boxes,
  FileText,
  LogOut,
} from "lucide-react";

const menu = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Student Enrollments", icon: UserPlus, path: "/enrollments" },
  { name: "Batches", icon: Boxes, path: "/batches" },
  { name: "Job Applications", icon: FileText, path: "/applications" },
];

export function BranchSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="w-64 h-screen bg-gradient-to-b from-[#0B1120] to-[#111827] text-white flex flex-col">

      {/* LOGO */}
      <div className="h-20 flex items-center gap-3 px-5 border-b border-white/10">
        <Image
          src="/Logo/MCJ_logo.png"
          alt="logo"
          width={42}
          height={42}
          priority
        />
        <div>
          <h2 className="text-sm font-semibold leading-none">
            MCJ Institute
          </h2>
          <p className="text-[11px] text-gray-400 mt-1 tracking-wide">
            BRANCH PANEL
          </p>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 px-3 py-6 space-y-2">

        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.path);

          return (
            <div
              key={item.name}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-pointer transition-all duration-200",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </div>
          );
        })}

      </div>

      {/* FOOTER (OPTIONAL USER INFO like your design) */}
      <div className="p-4 border-t border-white/10">
        <div className="text-xs text-gray-400 mb-2">
          Current Branch
        </div>
        <div className="bg-white/5 rounded-lg px-3 py-2 text-sm">
          Hubli Main
        </div>
      </div>

      {/* LOGOUT */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 text-red-400 cursor-pointer hover:bg-red-500/10 px-3 py-2 rounded-lg transition">
          <LogOut className="w-4 h-4" />
          <span className="text-sm">Sign Out</span>
        </div>
      </div>

    </aside>
  );
}