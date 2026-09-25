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
  MessageSquare,
  Newspaper,
  Briefcase,
  ClipboardList,
  Gift,
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
        name: "Batch Timings",
        icon: ClipboardList,
        path: "/batch-timings",
      },
      {
        name: "Batches",
        icon: Boxes,
        path: "/batches",
      },
      {
        name: "Branches",
        icon: GitBranch,
        path: "/branches",
      },
      {
        name: "Students",
        icon: Layers,
        path: "/students",
      },
      {
        name: "Users",
        icon: Users,
        path: "/users",
      },
      {
        name: "Enrollments",
        icon: ClipboardList,
        path: "/enrollments",
      },
      {
        name: "Referral & Rewards",
        icon: Gift,
        path: "/referral-rewards",
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
        icon: ClipboardList,
        path: "/job-applications",
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
        className="admin-sidebar relative flex h-full max-h-full min-h-0 shrink-0 flex-col border-r border-[#DCE8F5] text-[#102A56] transition-[width] duration-200 ease-in-out"
      >
        <div className="admin-sidebar-wash" aria-hidden="true" />

        <div
          className={cn(
            "flex h-[88px] w-full shrink-0 items-center justify-between border-b border-[#DCE8F5]/70",
            collapsed ? "gap-1 px-1.5" : "gap-3 px-3",
          )}
        >
          <div
            className={cn(
              "flex min-w-0 items-center overflow-hidden",
              collapsed ? "shrink-0" : "min-w-0 flex-1 gap-3",
            )}
          >
            <div
              className={cn(
                "relative shrink-0",
                collapsed ? "h-7 w-7" : "h-10 w-10",
              )}
            >
              <Image
                src="/Logo/MCJ_logo.png"
                alt="MCJ Academy"
                fill
                className="object-contain"
              />
            </div>

            {!collapsed ? (
              <div className="min-w-0 flex-1 pr-1">
                <h2 className="truncate text-[15px] font-bold tracking-tight text-[#102A56]">
                  MCJ Academy
                </h2>
                <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2563EB]">
                  Admin Platform
                </p>
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              "flex shrink-0 items-center justify-end",
              collapsed ? "w-7" : "w-8",
            )}
          >
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              className={cn(
                "flex shrink-0 items-center justify-center rounded-lg",
                collapsed ? "h-7 w-7" : "h-8 w-8",
                "border border-[#DCE8F5] bg-white text-[#102A56]",
                "shadow-[0_1px_6px_rgba(16,42,86,0.06)] transition-colors hover:bg-[#F8FBFF]",
              )}
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          </div>
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
