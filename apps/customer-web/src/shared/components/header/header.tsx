"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { User, LogOut, LayoutDashboard, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { AUTH_ROUTES } from "@/src/features/auth/constants/auth.constants";
import { useLogout } from "@/src/features/auth/hooks/use-logout";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Courses", href: "/courses" },
  { name: "Categories", href: "/categories" },
  { name: "Branches", href: "/branches" },
  { name: "My Learning", href: "/student/my-learning", protected: true },
  { name: "Contact Us", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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

  return (
    <header className="w-full bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/95 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-3 group transition-transform duration-200 active:scale-95"
        >
          <div className="relative flex items-center justify-center p-1 rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-[-4deg]">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400/0 via-orange-400/0 to-blue-500/0 group-hover:from-orange-400/15 group-hover:to-blue-500/15 blur-md transition-all duration-300" />
            <Image
              src="/logo/MCJ_logo.png"
              alt="MCJ Logo"
              width={42}
              height={42}
              priority
              style={{
                width: "auto",
                height: "auto",
              }}
              className="relative z-10 drop-shadow-sm"
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text transition-all duration-300 group-hover:from-orange-500 group-hover:to-blue-600">
            MCJ Academy
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 h-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <button
                key={item.name}
                onClick={() =>
                  item.protected
                    ? handleProtectedRoute(item.href)
                    : router.push(item.href)
                }
                className={`group relative flex items-center h-full text-[15px] font-medium tracking-wide transition-all duration-200 outline-none ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-orange-500"
                }`}
              >
                <span className="relative transition-transform duration-200 group-hover:-translate-y-0.5">
                  {item.name}
                </span>

                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-600 to-orange-500 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.4)]" />
                )}

                {!isActive && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[3px] bg-orange-500 rounded-t-full transition-all duration-300 ease-out group-hover:w-full shadow-[0_-2px_10px_rgba(249,115,22,0.35)]" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {!user && (
            <button
              onClick={() => router.push("/login")}
              className="relative overflow-hidden px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-orange-500/20 active:scale-95 group"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-orange-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10">Login</span>
            </button>
          )}

          {user && (
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/student")}
                className="group flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-gray-50/50 text-gray-700 font-semibold rounded-xl text-sm transition-all duration-300 hover:bg-white hover:border-orange-300 hover:text-orange-600 hover:shadow-md hover:shadow-orange-100 active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-500 transition-all duration-300 group-hover:text-orange-500 group-hover:rotate-[-8deg]" />
                Student
              </button>

              <div
                className="relative py-2"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <button className="flex items-center gap-1.5 p-1.5 rounded-full border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-md hover:shadow-blue-100 group">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-sm transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-orange-500 group-hover:to-blue-600 group-hover:text-white group-hover:scale-105">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 group-hover:text-blue-500 ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-3 py-2.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Account Status
                    </div>
                    <div className="px-3 pb-3 pt-0.5 border-b border-gray-50">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Logged In
                      </div>
                    </div>

                    <div className="mt-1.5">
                      <button
                        onClick={() => {
                          router.push("/student/my-learning");
                          setOpen(false);
                        }}
                        className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 hover:pl-4"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400 transition-colors duration-200 group-hover:text-orange-500" />
                        My Learning
                      </button>
                    </div>

                    <div className="mt-1.5">
                      <button
                        onClick={() => {
                          router.push("/student");
                          setOpen(false);
                        }}
                        className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-xl transition-all duration-200 hover:bg-orange-50 hover:text-orange-600 hover:pl-4"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400 transition-colors duration-200 group-hover:text-orange-500" />
                        Dashboard
                      </button>
                    </div>

                    <div className="mt-1 pt-1 border-t border-gray-50">
                      <button
                        onClick={handleLogout}
                        className="group flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 rounded-xl transition-all duration-200 hover:bg-red-50 hover:pl-4"
                      >
                        <LogOut className="w-4 h-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
