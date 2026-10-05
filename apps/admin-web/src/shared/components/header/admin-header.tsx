"use client";



import Link from "next/link";
import { useRouter } from "next/navigation";

import { Avatar } from "@/src/shared/components/ui/avatar";

import { useEffect, useState, useRef } from "react";

import {

  Settings,

  LogOut,

  ChevronDown,

  Bell,

  Menu,

} from "lucide-react";

import { useAuth } from "@/src/features/auth/hooks/use-auth";

import { toast } from "sonner";

import { cn } from "@/src/shared/lib/cn";

import { AdminGlobalSearch } from "@/src/shared/components/header/admin-global-search";
import { useOnlineEnrollmentNotifications } from "@/src/features/enrollments/hooks/use-online-enrollment-notifications";
import { formatCount } from "@/src/features/dashboard/utils/dashboard-date.utils";

const ENROLLMENT_NOTIFICATIONS_HREF =
  "/enrollments?adminTab=active&applicationType=ONLINE";



function formatAdminRoleLabel(role?: string) {

  if (!role) {

    return "Administrator";

  }



  if (role === "ADMIN") {

    return "Super Admin";

  }



  return role

    .split("_")

    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())

    .join(" ");

}



const iconActionClass = cn(

  "flex h-10 w-10 items-center justify-center rounded-lg",

  "bg-transparent text-[#2563EB]",

  "transition-colors hover:bg-[#2563EB]/8 hover:text-[#102A56]",

);



interface AdminHeaderProps {
  onOpenMobileNav?: () => void;
}

export function AdminHeader({ onOpenMobileNav }: AdminHeaderProps) {

  const [time, setTime] = useState("");

  const [date, setDate] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  const notificationRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const { logout, user } = useAuth();

  const {
    count: onlineEnrollmentNotificationCount,
    acknowledge: acknowledgeEnrollmentNotifications,
    refresh: refreshEnrollmentNotifications,
  } = useOnlineEnrollmentNotifications();



  useEffect(() => {

    const updateTime = () => {

      const now = new Date();

      const formattedTime = now.toLocaleTimeString("en-IN", {

        hour: "2-digit",

        minute: "2-digit",

      });

      const formattedDate = now.toLocaleDateString("en-IN", {

        weekday: "short",

        day: "2-digit",

        month: "short",

        year: "numeric",

      });

      setTime(formattedTime);

      setDate(formattedDate);

    };

    updateTime();

    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);

  }, []);



  const handleLogout = async () => {

    try {

      await logout();

      toast.success("Logged out successfully");

    } catch {

      toast.error("Failed to logout");

    }

  };



  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {

      if (

        profileRef.current &&

        !profileRef.current.contains(event.target as Node)

      ) {

        setDropdownOpen(false);

      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }

    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);

  }, []);



  const displayName = user?.name?.trim() || "Admin";

  const roleLabel = formatAdminRoleLabel(user?.role);



  const initials = displayName

    .split(" ")

    .map((part) => part[0])

    .join("")

    .slice(0, 2)

    .toUpperCase();



  return (

    <header

      className={cn(

        "relative shrink-0 border-b border-[#DCE8F5]",

        "bg-gradient-to-r from-white via-[#FBFDFF] to-[#F0F7FF]",

        "shadow-[0_4px_20px_rgba(16,42,86,0.05)]",

        "px-4 py-3 md:px-6 lg:px-8",

      )}

    >

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#2563EB]/20 to-transparent" />



      <div className="flex min-h-[60px] flex-wrap items-center gap-x-4 gap-y-3 lg:min-h-[64px] lg:gap-4">

        {onOpenMobileNav ? (
          <button
            type="button"
            aria-label="Open navigation menu"
            onClick={onOpenMobileNav}
            className={cn(iconActionClass, "lg:hidden")}
          >
            <Menu className="h-5 w-5" />
          </button>
        ) : null}

        <div className="min-w-0 shrink-0 basis-full sm:basis-auto lg:max-w-[280px] xl:max-w-xs">

          <p className="truncate text-sm font-semibold text-[#102A56]">

            Welcome back, {displayName}

          </p>

          <p className="truncate text-xs text-[#647A9B]">

            Manage your academy from one place

          </p>

        </div>



        <AdminGlobalSearch className="min-w-0 flex-1 basis-full sm:basis-0 sm:min-w-[220px] lg:max-w-xl" />



        <div className="ml-auto flex shrink-0 basis-full items-center justify-end gap-2 sm:basis-auto sm:gap-3">

          <span className="text-[10px] tabular-nums text-[#647A9B] sm:hidden">

            {time ? `${time} · ${date}` : null}

          </span>

          <div

            className={cn(

              "hidden flex-col rounded-xl border border-[#E8F1FF] bg-white/80 px-3 py-1.5 text-right",

              "shadow-[0_1px_4px_rgba(16,42,86,0.04)] sm:flex",

            )}

          >

            <span className="text-xs font-semibold tabular-nums text-[#102A56]">

              {time}

            </span>

            <span className="text-[10px] leading-tight text-[#647A9B]">

              {date}

            </span>

          </div>



          <div ref={notificationRef} className="relative">
            <button
              type="button"
              className={cn(iconActionClass, "relative")}
              aria-label="Notifications"
              aria-expanded={notificationOpen}
              onClick={() => {
                setNotificationOpen((open) => !open);
                setDropdownOpen(false);
              }}
            >
              <Bell className="h-[18px] w-[18px]" strokeWidth={1.75} />
              {onlineEnrollmentNotificationCount > 0 ? (
                <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {onlineEnrollmentNotificationCount > 9
                    ? "9+"
                    : formatCount(onlineEnrollmentNotificationCount)}
                </span>
              ) : null}
            </button>

            {notificationOpen ? (
              <div
                className={cn(
                  "absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-2xl",
                  "border border-[#DCE8F5] bg-white",
                  "shadow-[0_12px_40px_rgba(16,42,86,0.12)]",
                )}
              >
                <div className="border-b border-[#E8F1FF] bg-gradient-to-br from-[#F8FBFF] to-white px-4 py-3">
                  <p className="text-sm font-semibold text-[#102A56]">
                    Notifications
                  </p>
                </div>
                <div className="p-1.5">
                  {onlineEnrollmentNotificationCount > 0 ? (
                    <button
                      type="button"
                      className="flex w-full flex-col items-start gap-0.5 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-[#F4F9FF]"
                      onClick={() => {
                        void (async () => {
                          await refreshEnrollmentNotifications();
                          acknowledgeEnrollmentNotifications();
                          setNotificationOpen(false);
                          router.push(ENROLLMENT_NOTIFICATIONS_HREF);
                        })();
                      }}
                    >
                      <span className="font-semibold text-[#102A56]">
                        {formatCount(onlineEnrollmentNotificationCount)} new
                        online enrollment
                        {onlineEnrollmentNotificationCount === 1 ? "" : "s"}
                      </span>
                      <span className="text-xs text-[#647A9B]">
                        View in Advanced / Admitted
                      </span>
                    </button>
                  ) : (
                    <p className="px-3 py-4 text-center text-sm text-[#647A9B]">
                      No new online enrollments
                    </p>
                  )}
                </div>
              </div>
            ) : null}
          </div>



          <Link href="/settings" className={iconActionClass} aria-label="Settings">

            <Settings className="h-[18px] w-[18px]" strokeWidth={1.75} />

          </Link>



          <div ref={profileRef} className="relative">

            <button

              type="button"

              onClick={() => setDropdownOpen((open) => !open)}

              className={cn(

                "flex cursor-pointer items-center gap-1.5 rounded-xl border border-[#E8F1FF]",

                "bg-white/90 py-1 pl-1 pr-2 shadow-[0_1px_4px_rgba(16,42,86,0.04)]",

                "transition-colors hover:border-[#2563EB]/25 hover:bg-[#F4F9FF]",

              )}

              aria-expanded={dropdownOpen}

              aria-haspopup="menu"

            >

              <Avatar alt={displayName} fallback={initials} size="sm" />

              <ChevronDown

                className={cn(

                  "h-3.5 w-3.5 text-[#647A9B] transition-transform",

                  dropdownOpen && "rotate-180",

                )}

              />

            </button>



            {dropdownOpen ? (

              <div

                className={cn(

                  "absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl",

                  "border border-[#DCE8F5] bg-white",

                  "shadow-[0_12px_40px_rgba(16,42,86,0.12)]",

                )}

              >

                <div className="border-b border-[#E8F1FF] bg-gradient-to-br from-[#F8FBFF] to-white px-4 py-3">

                  <p className="truncate text-sm font-semibold text-[#102A56]">

                    {displayName}

                  </p>

                  <p className="mt-0.5 truncate text-xs text-[#647A9B]">

                    {user?.email ?? ""}

                  </p>

                  <p className="mt-1.5 inline-flex rounded-md bg-[#E8F1FF] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#2563EB]">

                    {roleLabel}

                  </p>

                </div>



                <div className="p-1.5">

                  <button

                    type="button"

                    onClick={handleLogout}

                    className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50"

                  >

                    <LogOut className="h-4 w-4" />

                    Sign Out

                  </button>

                </div>

              </div>

            ) : null}

          </div>

        </div>

      </div>

    </header>

  );

}


