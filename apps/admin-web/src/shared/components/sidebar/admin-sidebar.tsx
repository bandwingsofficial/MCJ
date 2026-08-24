"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/src/shared/lib/cn";

import { useAuth } from "@/src/features/auth/hooks/use-auth";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { toast } from "sonner";

import {
  LayoutDashboard,
  Users,
  Layers,
  GitBranch,
  BookOpen,
  Boxes,
  WifiOff,
  Globe,
  Video,
  MessageSquare,
  Newspaper,
  Briefcase,
  FileText,
  ClipboardList,
  Settings,
  LogOut,
} from "lucide-react";

const menu = [
  {
    section: "MAIN",
    items: [
      {
        name: "Dashboard",
        icon: LayoutDashboard,
        path: "/dashboard",
      },
      {
        name: "Category",
        icon: Layers,
        path: "/categories",
      },
      {
        name: "Branches",
        icon: GitBranch,
        path: "/branches",
      },
      {
        name: "Trainers",
        icon: Users,
        path: "/trainers",
      },
      {
        name: "Courses",
        icon: BookOpen,
        path: "/courses",
      },
      {
        name: "Batches",
        icon: Boxes,
        path: "/batches",
      },
      {
        name: "Students",
        icon: Layers,
        path: "/students",
      },
      {
        name: "Enrollments",
        icon: ClipboardList,
        path: "/enrollments",
      },
    ],
  },
  {
    section: "MANAGEMENT",
    items: [
      {
        name: "Offline Management",
        icon: WifiOff,
        path: "/offline",
      },
      {
        name: "Online Management",
        icon: Globe,
        path: "/online",
      },
      {
        name: "Recorded Management",
        icon: Video,
        path: "/recorded",
      },
    ],
  },
  {
    section: "ECOSYSTEM",
    items: [
      {
        name: "Community",
        icon: MessageSquare,
        path: "/community",
      },
      {
        name: "Finance News",
        icon: Newspaper,
        path: "/finance-news",
      },
      {
        name: "Jobs",
        icon: Briefcase,
        path: "/jobs",
      },
      {
        name: "Job Applications",
        icon: FileText,
        path: "/job-applications",
      },
      {
        name: "Placements",
        icon: FileText,
        path: "/placements",
      },
      {
        name: "Settings",
        icon: Settings,
        path: "/settings",
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  const [logoutOpen, setLogoutOpen] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      toast.success("Logged out successfully");
    } catch {
      toast.error("Failed to logout");
    } finally {
      setLogoutLoading(false);
      setLogoutOpen(false);
    }
  };

  return (
    <>
      <aside className="w-64 h-screen bg-gradient-to-b from-[#0B1120] to-[#111827] text-white flex flex-col border-r border-white/5 shadow-2xl shadow-black/40">
        {/* LOGO */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-sm">
          <div className="relative w-10 h-10">
            <Image
              src="/Logo/MCJ_logo.png"
              alt="logo"
              fill
              className="object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
            />
          </div>

          <div>
            <h2 className="text-sm font-bold tracking-tight text-white">
              MCJ Institute
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-amber-400 font-medium">
              Admin Platform
            </p>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {menu.map((group) => (
            <div key={group.section}>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 px-3 mb-2 font-semibold">
                {group.section}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;

                  return (
                    <Link href={item.path} key={item.name}>
                      <div
                        className={cn(
                          "group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 cursor-pointer",
                          "hover:bg-white/5 hover:translate-x-1",
                          isActive
                            ? "bg-gradient-to-r from-amber-500/10 to-amber-600/5 text-amber-300 border border-amber-500/20 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                            : "text-gray-400 hover:text-white"
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-transform duration-200",
                            isActive && "text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]",
                            "group-hover:scale-110"
                          )}
                        />
                        <span className={cn(isActive && "font-medium")}>
                          {item.name}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10 bg-gradient-to-t from-[#0B1120] to-transparent">
          <button
            type="button"
            onClick={() => setLogoutOpen(true)}
            className="w-full flex items-center gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-2.5 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 transition-transform group-hover:scale-110 group-hover:-translate-x-1" />
            <span className="text-sm font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={logoutOpen}
        title="Sign Out"
        description="Are you sure you want to sign out from the admin platform?"
        loading={logoutLoading}
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}