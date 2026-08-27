"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";

import { cn } from "@/src/shared/lib/cn";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { useAuth } from "@/src/features/auth/hooks/use-auth";

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
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import {
  ADMIN_SIDEBAR_WIDTH_COLLAPSED_PX,
  ADMIN_SIDEBAR_WIDTH_EXPANDED_PX,
} from "./admin-sidebar.constants";
import { useAdminSidebarCollapsed } from "./use-admin-sidebar";

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

function SidebarTooltip({
  label,
  enabled,
  children,
}: {
  label: string;
  enabled: boolean;
  children: ReactNode;
}) {
  if (!enabled) {
    return children;
  }

  return (
    <Tooltip
      content={label}
      side="right"
      sideOffset={12}
      delayDuration={120}
    >
      {children}
    </Tooltip>
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { collapsed, toggleCollapsed } = useAdminSidebarCollapsed();

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

  const sidebarWidth = collapsed
    ? ADMIN_SIDEBAR_WIDTH_COLLAPSED_PX
    : ADMIN_SIDEBAR_WIDTH_EXPANDED_PX;

  return (
    <>
      <aside
        style={{ width: sidebarWidth }}
        className="flex h-screen shrink-0 flex-col border-r border-white/5 bg-gradient-to-b from-[#0B1120] to-[#111827] text-white shadow-2xl shadow-black/40 transition-[width] duration-200 ease-in-out"
      >
        <div
          className={cn(
            "flex h-20 shrink-0 items-center border-b border-white/10 bg-[#0B1120]/80 backdrop-blur-sm",
            collapsed ? "justify-center px-2" : "gap-3 px-5",
          )}
        >
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/Logo/MCJ_logo.png"
              alt="logo"
              fill
              className="object-contain drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
            />
          </div>

          {!collapsed ? (
            <div className="min-w-0">
              <h2 className="text-sm font-bold tracking-tight text-white">
                MCJ Institute
              </h2>
              <p className="text-[10px] font-medium uppercase tracking-widest text-amber-400">
                Admin Platform
              </p>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "custom-scrollbar flex-1 space-y-6 overflow-y-auto overflow-x-hidden py-4",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {menu.map((group) => (
            <div key={group.section}>
              {!collapsed ? (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-500">
                  {group.section}
                </p>
              ) : (
                <div className="mx-auto mb-2 h-px w-6 bg-white/10" />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;

                  return (
                    <SidebarTooltip
                      key={item.name}
                      label={item.name}
                      enabled={collapsed}
                    >
                      <Link
                        href={item.path}
                        className={cn(
                          "group flex items-center rounded-xl text-sm transition-all duration-200",
                          collapsed
                            ? "h-10 justify-center px-0"
                            : "gap-3 px-3 py-2.5 hover:translate-x-1",
                          "hover:bg-white/5",
                          isActive
                            ? "border border-amber-500/20 bg-gradient-to-r from-amber-500/10 to-amber-600/5 text-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.15)]"
                            : "text-gray-400 hover:text-white",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-5 w-5 shrink-0 transition-transform duration-200",
                            isActive &&
                              "text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]",
                            "group-hover:scale-110",
                          )}
                        />
                        {!collapsed ? (
                          <span className={cn("truncate", isActive && "font-medium")}>
                            {item.name}
                          </span>
                        ) : null}
                      </Link>
                    </SidebarTooltip>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div
          className={cn(
            "shrink-0 border-t border-white/10 bg-gradient-to-t from-[#0B1120] to-transparent",
            collapsed ? "p-2" : "p-4",
          )}
        >
          <SidebarTooltip
            label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            enabled={collapsed}
          >
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className={cn(
                "mb-1 flex w-full items-center rounded-xl text-gray-400 transition-all duration-200 hover:bg-white/5 hover:text-white",
                collapsed ? "h-10 justify-center" : "gap-3 px-3 py-2.5",
              )}
            >
              {collapsed ? (
                <ChevronsRight className="h-5 w-5 shrink-0" />
              ) : (
                <>
                  <ChevronsLeft className="h-5 w-5 shrink-0" />
                  <span className="text-sm font-medium">Collapse</span>
                </>
              )}
            </button>
          </SidebarTooltip>

          <SidebarTooltip label="Sign Out" enabled={collapsed}>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className={cn(
                "group flex w-full items-center rounded-xl text-red-400 transition-all duration-200 hover:bg-red-500/10 hover:text-red-300",
                collapsed ? "h-10 justify-center" : "gap-3 px-3 py-2.5",
              )}
            >
              <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110 group-hover:-translate-x-1" />
              {!collapsed ? (
                <span className="text-sm font-medium">Sign Out</span>
              ) : null}
            </button>
          </SidebarTooltip>
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
