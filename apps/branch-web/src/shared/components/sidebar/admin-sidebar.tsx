"use client";

import Image from "next/image";

import {
  usePathname,
  useRouter,
} from "next/navigation";

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
  const pathname =
    usePathname();

  const router =
    useRouter();

  const {
    user,
    logout,
  } = useAuth();

  const handleLogout =
    async (): Promise<void> => {
      try {
        await logout();

        appToast.success(
          "Logged out successfully"
        );
      } catch {
        appToast.error(
          "Logout failed"
        );
      }
    };

  return (
    <aside className="flex h-screen w-64 flex-col bg-gradient-to-b from-[#0B1120] to-[#111827] text-white">
      {/* LOGO */}
      <div className="flex h-20 items-center gap-3 border-b border-white/10 px-5">
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

          <p className="mt-1 text-[11px] tracking-wide text-gray-400">
            BRANCH PANEL
          </p>
        </div>
      </div>

      {/* MENU */}
      <div className="flex-1 space-y-2 px-3 py-6">
        {menu.map(
          (item) => {
            const Icon =
              item.icon;

            const isActive =
              pathname.startsWith(
                item.path
              );

            return (
              <div
                key={
                  item.name
                }
                onClick={() =>
                  router.push(
                    item.path
                  )
                }
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200",
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />

                <span>
                  {item.name}
                </span>
              </div>
            );
          }
        )}
      </div>

      {/* FOOTER */}
      <div className="border-t border-white/10 p-4">
        <div className="mb-2 text-xs text-gray-400">
          Current Branch
        </div>

        <div className="truncate rounded-lg bg-white/5 px-3 py-2 text-sm">
          {user?.branchId
            ? user.branchId.slice(
                0,
                12
              )
            : "Branch"}
        </div>
      </div>

      {/* LOGOUT */}
      <div className="px-4 pb-4">
        <button
          onClick={
            handleLogout
          }
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-red-400 transition hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />

          <span className="text-sm">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}