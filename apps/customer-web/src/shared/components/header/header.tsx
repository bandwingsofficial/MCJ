"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  BriefcaseBusiness,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { AUTH_ROUTES } from "@/src/features/auth/constants/auth.constants";
import { useLogout } from "@/src/features/auth/hooks/use-logout";
import { useStudentPortalNavigation } from "@/src/features/student/context/StudentPortalNavigationProvider";
import { MCJ_NAV_ITEMS } from "@/src/shared/constants/site.constants";
import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";

import { SiteSearchDialog } from "./site-search-dialog";

function AccountDropdownItem({
  label,
  icon: Icon,
  onClick,
}: {
  label: string;
  icon: typeof User;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-blue-50 hover:pl-4 hover:text-[#2563EB]"
    >
      <Icon className="h-4 w-4 text-gray-400 transition-colors group-hover:text-[#2563EB]" />
      {label}
    </button>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const navigation = useStudentPortalNavigation();

  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!mounted) {
    return null;
  }

  const handleProtectedRoute = (href: string) => {
    if (!user) {
      router.push(AUTH_ROUTES.LOGIN);
      return;
    }
    router.push(href);
  };

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const showMyApplications =
    !navigation.isLoading && navigation.showMyApplications;
  const showMyCourses =
    !navigation.isLoading && navigation.showMyCourses;
  const showMyEnrollment =
    !navigation.isLoading && navigation.showMyEnrollment;

  const navigateFromDropdown = (href: string) => {
    router.push(href);
    setOpen(false);
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/logo/MCJ_logo.png"
              alt="MCJ Academy"
              width={42}
              height={42}
              priority
              className="h-10 w-auto"
            />
            <span className="text-lg font-bold tracking-tight text-[#0B1F3A] sm:text-xl">
              MCJ Academy
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {MCJ_NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "text-[#2563EB] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-[#2563EB]"
                    : "text-slate-600 hover:text-[#0B1F3A]",
                )}
              >
                {item.name}
              </Link>
            ))}
            {showMyCourses ? (
              <button
                type="button"
                onClick={() => handleProtectedRoute("/student/my-learning")}
                className={cn(
                  "relative py-2 text-sm font-medium transition-colors",
                  isActive("/student/my-learning")
                    ? "text-[#2563EB]"
                    : "text-slate-600 hover:text-[#0B1F3A]",
                )}
              >
                My Learning
              </button>
            ) : null}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden rounded-xl border border-slate-200 p-2.5 text-slate-600 transition hover:border-[#2563EB]/30 hover:text-[#2563EB] md:inline-flex"
              aria-label="Search courses"
            >
              <Search className="h-4 w-4" />
            </button>

            {!user ? (
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="hidden rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#2563EB]/30 sm:inline-flex"
              >
                Login
              </button>
            ) : null}

            <Link href="/contact" className="hidden sm:inline-flex">
              <Button className="rounded-xl bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white hover:bg-[#102A56]">
                Enquire Now →
              </Button>
            </Link>

            {user ? (
              <div
                className="relative hidden py-2 lg:block"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <button className="group flex items-center gap-1.5 rounded-full border border-slate-200 bg-white p-1.5 transition hover:border-[#2563EB]/30">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-[#2563EB]">
                    <User className="h-4 w-4" />
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-slate-400 transition-transform",
                      open && "rotate-180",
                    )}
                  />
                </button>

                {open ? (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-100 bg-white p-2 shadow-xl">
                    <div className="space-y-0.5">
                      {navigation.showProfile ? (
                        <AccountDropdownItem
                          label="Profile"
                          icon={User}
                          onClick={() => navigateFromDropdown("/student/profile")}
                        />
                      ) : null}
                      {showMyApplications ? (
                        <AccountDropdownItem
                          label="My Applications"
                          icon={BriefcaseBusiness}
                          onClick={() =>
                            navigateFromDropdown("/student/applications")
                          }
                        />
                      ) : null}
                      {showMyCourses ? (
                        <AccountDropdownItem
                          label="My Course"
                          icon={LayoutDashboard}
                          onClick={() =>
                            navigateFromDropdown("/student/my-learning")
                          }
                        />
                      ) : null}
                      {showMyEnrollment ? (
                        <AccountDropdownItem
                          label="My Enrollment"
                          icon={LayoutDashboard}
                          onClick={() =>
                            navigateFromDropdown("/student/enrollments")
                          }
                        />
                      ) : null}
                    </div>
                    <div className="mt-1 border-t border-slate-100 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              className="rounded-xl border border-slate-200 p-2.5 text-slate-700 lg:hidden"
              onClick={() => setMobileOpen((current) => !current)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <div className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {MCJ_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-xl px-3 py-2.5 text-sm font-medium",
                    isActive(item.href)
                      ? "bg-blue-50 text-[#2563EB]"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {item.name}
                </Link>
              ))}
              {showMyCourses ? (
                <button
                  type="button"
                  onClick={() => handleProtectedRoute("/student/my-learning")}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  My Learning
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Search Courses
              </button>
              {!user ? (
                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="rounded-xl px-3 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Login
                </button>
              ) : null}
              <Link
                href="/contact"
                className="mt-2 inline-flex justify-center rounded-xl bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Enquire Now →
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <SiteSearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
