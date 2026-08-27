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
  ChevronLeft,
  ChevronRight,
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
        className="admin-sidebar relative flex h-screen shrink-0 flex-col border-r border-[#DCE8F5] text-[#102A56] transition-[width] duration-200 ease-in-out"
      >
        <div className="admin-sidebar-wash" aria-hidden="true" />

        <div
          className={cn(
            "flex h-[88px] shrink-0 items-center",
            collapsed ? "justify-center px-2" : "gap-3 px-5",
          )}
        >
          <div className="relative h-10 w-10 shrink-0">
            <Image
              src="/Logo/MCJ_logo.png"
              alt="logo"
              fill
              className="object-contain"
            />
          </div>

          {!collapsed ? (
            <div className="min-w-0">
              <h2 className="text-[15px] font-bold tracking-tight text-[#102A56]">
                MCJ Institute
              </h2>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
                Admin Platform
              </p>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "custom-scrollbar flex-1 space-y-6 overflow-y-auto overflow-x-hidden py-3",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {menu.map((group) => (
            <div key={group.section}>
              {!collapsed ? (
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#647A9B]">
                  {group.section}
                </p>
              ) : (
                <div className="mx-auto mb-2 h-px w-6 bg-[#DCE8F5]" />
              )}

              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.path ||
                    pathname.startsWith(`${item.path}/`);

                  return (
                    <SidebarTooltip
                      key={item.name}
                      label={item.name}
                      enabled={collapsed}
                    >
                      <Link
                        href={item.path}
                        className={cn(
                          "group flex items-center text-sm transition-all duration-200",
                          collapsed
                            ? "h-11 justify-center rounded-2xl px-0"
                            : "gap-3 rounded-2xl px-3 py-2.5",
                          isActive
                            ? "bg-white font-medium text-[#2563EB] shadow-[0_2px_10px_rgba(16,42,86,0.07)]"
                            : "bg-transparent text-[#102A56] hover:bg-white/70",
                        )}
                      >
                        <Icon
                          className="h-[22px] w-[22px] shrink-0 text-[#2563EB]"
                          strokeWidth={1.75}
                        />
                        {!collapsed ? (
                          <span className="truncate">{item.name}</span>
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
            "shrink-0 pb-6",
            collapsed ? "p-2" : "px-3 pt-3",
          )}
        >
          <SidebarTooltip label="Sign Out" enabled={collapsed}>
            <button
              type="button"
              onClick={() => setLogoutOpen(true)}
              className={cn(
                "group flex w-full items-center rounded-2xl text-rose-500 transition-colors duration-200 hover:bg-white/80 hover:text-rose-600",
                collapsed ? "h-11 justify-center" : "gap-3 px-3 py-2.5",
              )}
            >
              <LogOut className="h-[22px] w-[22px] shrink-0" strokeWidth={1.75} />
              {!collapsed ? (
                <span className="text-sm font-medium">Sign Out</span>
              ) : null}
            </button>
          </SidebarTooltip>
        </div>

        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!collapsed}
          className="absolute -right-3 bottom-24 z-30 flex h-8 w-8 items-center justify-center rounded-full border border-[#DCE8F5] bg-white text-[#102A56] shadow-[0_2px_10px_rgba(16,42,86,0.08)] transition-colors hover:bg-[#F8FBFF]"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
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
