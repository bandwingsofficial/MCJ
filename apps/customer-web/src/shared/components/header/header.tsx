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
  { name: "Jobs", href: "/jobs" },
  { name: "Courses", href: "/courses" },
  { name: "Franchise", href: "/franchise" },
  { name: "Batches", href: "/batch" },
  { name: "Finance News", href: "/finance-news" },
  { name: "Contact Us", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // =========================
  // HYDRATION FIX
  // =========================
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // =========================
  // PROTECTED ROUTE
  // =========================
  const handleProtectedRoute = (href: string) => {
    if (!user) {
      router.push(AUTH_ROUTES.LOGIN);
      return;
    }
    router.push(href);
  };

  // =========================
  // LOGOUT
  // =========================
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
        
        {/* ================= LOGO ================= */}
        <Link
          href="/"
          className="flex items-center gap-3 group transition-transform duration-200 active:scale-95"
        >
          <div className="relative flex items-center justify-center p-1 rounded-xl transition-colors duration-200">
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
            />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
            MCJ Institute
          </span>
        </Link>

        {/* ================= NAVIGATION ================= */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`relative flex items-center h-full text-[15px] font-medium tracking-wide transition-all duration-200 outline-none ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-blue-600"
                }`}
              >
                {item.name}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.4)]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* ================= RIGHT SIDE ================= */}
        <div className="flex items-center gap-4">
          
          {/* ================= NOT LOGGED IN ================= */}
          {!user && (
            <button
              onClick={() => router.push("/login")}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow active:scale-98"
            >
              Login
            </button>
          )}

          {/* ================= LOGGED IN ================= */}
          {user && (
            <div className="flex items-center gap-4">
              
              {/* STUDENT BUTTON */}
              <button
                onClick={() => router.push("/student")}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-gray-50/50 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-100 hover:text-gray-900 transition-all duration-200 active:scale-98"
              >
                <LayoutDashboard className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                Student
              </button>

              {/* PROFILE MENU */}
              <div
                className="relative py-2"
                onMouseEnter={() => setOpen(true)}
                onMouseLeave={() => setOpen(false)}
              >
                <button className="flex items-center gap-1.5 p-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:shadow-sm transition-all duration-200 group">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 font-semibold text-sm">
                    <User className="w-4 h-4" />
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    
                    {/* USER INFO */}
                    <div className="px-3 py-2.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                      Account Status
                    </div>
                    <div className="px-3 pb-3 pt-0.5 border-b border-gray-50">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Logged In
                      </div>
                    </div>

                    {/* DASHBOARD */}
                    <div className="mt-1.5">
                      <button
                        onClick={() => {
                          router.push("/student");
                          setOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-gray-400" />
                        Dashboard
                      </button>
                    </div>

                    {/* LOGOUT */}
                    <div className="mt-1 pt-1 border-t border-gray-50">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
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