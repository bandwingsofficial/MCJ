"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UserPlus,
  Boxes,
  FileText,
  LogOut,
  ClipboardCheck,
  GraduationCap,
  CalendarClock,
  Briefcase,
  UserCog,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { cn } from "@/src/shared/lib/cn";
import { useAuth } from "@/src/features/auth/hooks/use-auth";
import { appToast } from "@/src/shared/lib/toast";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import {
  ADMIN_SIDEBAR_WIDTH_COLLAPSED_PX,
  ADMIN_SIDEBAR_WIDTH_EXPANDED_PX,
} from "./admin-sidebar.constants";
import { useAdminSidebarCollapsed } from "./use-admin-sidebar";

interface MenuItem {
  name: string;
  icon: typeof LayoutDashboard;
  path: string;
}

const MANAGER_MENU: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Users", icon: UserCog, path: "/users" },
  { name: "Batches", icon: Boxes, path: "/batches" },
  { name: "Student Enrollments", icon: UserPlus, path: "/enrollments" },
  { name: "Attendance", icon: ClipboardCheck, path: "/attendance" },
  { name: "Marks / Assessments", icon: GraduationCap, path: "/assessments" },
  { name: "Job Applications", icon: FileText, path: "/job-applications" },
  { name: "Interviews", icon: CalendarClock, path: "/interviews" },
  { name: "Placement Activities", icon: Briefcase, path: "/placements" },
  { name: "Settings", icon: Settings, path: "/settings" },
];

const FACULTY_MENU: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "My Batches", icon: Boxes, path: "/batches" },
  { name: "Enrolled Students", icon: UserPlus, path: "/enrollments" },
  { name: "Attendance", icon: ClipboardCheck, path: "/attendance" },
  { name: "Marks / Assessments", icon: GraduationCap, path: "/assessments" },
];

const INTERVIEWER_MENU: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Job Applications", icon: FileText, path: "/job-applications" },
  { name: "Interviews", icon: CalendarClock, path: "/interviews" },
  { name: "Placement Activities", icon: Briefcase, path: "/placements" },
];

const STAFF_MENU: MenuItem[] = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { name: "Batches", icon: Boxes, path: "/batches" },
  { name: "Student Enrollments", icon: UserPlus, path: "/enrollments" },
];

function menuForRole(role?: string): MenuItem[] {
  if (!role) return [];
  if (role === "FACULTY") return FACULTY_MENU;
  if (role === "INTERVIEWER") return INTERVIEWER_MENU;
  if (role === "BRANCH_MANAGER") return MANAGER_MENU;
  return STAFF_MENU;
}

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
    <Tooltip content={label} side="right" sideOffset={12} delayDuration={120}>
      {children}
    </Tooltip>
  );
}

export function BranchSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { collapsed, toggleCollapsed } = useAdminSidebarCollapsed();

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

  const menu = menuForRole(user?.role);
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
                {formatRoleLabel(user?.role) || "Branch Portal"}
              </p>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "custom-scrollbar flex-1 space-y-1 overflow-y-auto overflow-x-hidden py-3",
            collapsed ? "px-2" : "px-3",
          )}
        >
          {!collapsed ? (
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#647A9B]">
              Navigation
            </p>
          ) : (
            <div className="mx-auto mb-2 h-px w-6 bg-[#DCE8F5]" />
          )}

          {menu.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.path || pathname.startsWith(`${item.path}/`);

            return (
              <SidebarTooltip
                key={item.path}
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

        <div className={cn("shrink-0 pb-6", collapsed ? "p-2" : "px-3 pt-3")}>
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
        description="Are you sure you want to sign out from the branch platform?"
        loading={logoutLoading}
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </>
  );
}
