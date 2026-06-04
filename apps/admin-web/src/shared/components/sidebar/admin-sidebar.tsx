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
  UserPlus,
  WifiOff,
  Globe,
  Video,
  MessageSquare,
  Newspaper,
  Briefcase,
  FileText,
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
        name: "Branch-Users",
        icon: Users,
        path: "/branch-users",
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
        name: "Student Enrollments",
        icon: UserPlus,
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
        path: "/applications",
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

  const [logoutOpen, setLogoutOpen] =
    useState(false);

  const [logoutLoading, setLogoutLoading] =
    useState(false);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);

      await logout();

      toast.success(
        "Logged out successfully"
      );
    } catch {
      toast.error(
        "Failed to logout"
      );
    } finally {
      setLogoutLoading(false);

      setLogoutOpen(false);
    }
  };

  return (
    <>
      <aside className="w-64 h-screen bg-gradient-to-b from-[#0B1120] to-[#111827] text-white flex flex-col">
        {/* LOGO */}
        <div className="h-20 flex items-center gap-3 px-5 border-b border-white/10">
          <Image
            src="/Logo/MCJ_logo.png"
            alt="logo"
            width={40}
            height={40}
          />

          <div>
            <h2 className="text-sm font-semibold">
              MCJ Institute
            </h2>

            <p className="text-xs text-gray-400">
              ADMIN PLATFORM
            </p>
          </div>
        </div>

        {/* MENU */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 custom-scrollbar">
          {menu.map((group) => (
            <div key={group.section}>
              <p className="text-xs text-gray-500 px-3 mb-2 tracking-wider">
                {group.section}
              </p>

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;

                  const isActive =
                    pathname === item.path;

                  return (
                    <Link
                      href={item.path}
                      key={item.name}
                    >
                      <div
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all cursor-pointer",
                          isActive
                            ? "bg-white/10 text-white"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        <Icon className="w-4 h-4" />

                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* LOGOUT */}
        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={() =>
              setLogoutOpen(true)
            }
            className="w-full flex items-center gap-3 text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition"
          >
            <LogOut className="w-4 h-4" />

            Sign Out
          </button>
        </div>
      </aside>

      <ConfirmDialog
        open={logoutOpen}
        title="Sign Out"
        description="Are you sure you want to sign out from the admin platform?"
        loading={logoutLoading}
        onConfirm={handleLogout}
        onCancel={() =>
          setLogoutOpen(false)
        }
      />
    </>
  );
}