"use client";

import Link from "next/link";

import Image from "next/image";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

import {
  useState,
  useEffect,
} from "react";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { AUTH_ROUTES } from "@/src/features/auth/constants/auth.constants";
import { useLogout } from "@/src/features/auth/hooks/use-logout";

const navItems = [
  { name: "Home", href: "/" },

  { name: "Jobs", href: "/jobs" },

  { name: "Courses", href: "/courses" },

  { name: "Franchise", href: "/franchise" },

  {
    name: "Finance News",
    href: "/finance-news",
  },

  {
    name: "Contact Us",
    href: "/contact",
  },
];

export function Header() {
  const pathname = usePathname();

  const router = useRouter();

  const user = useAuthStore(
    (state) => state.user
  );

const logoutMutation = useLogout();

  const [open, setOpen] = useState(false);

  const [mounted, setMounted] =
    useState(false);

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

  const handleProtectedRoute = (
  href: string
) => {
  if (!user) {
    router.push(
      AUTH_ROUTES.LOGIN
    );

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
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* ================= LOGO ================= */}

        <Link
          href="/"
          className="flex items-center gap-3"
        >
          <Image
            src="/logo/MCJ_logo.png"
            alt="MCJ Logo"
            width={40}
            height={40}
            priority
            style={{
              width: "auto",
              height: "auto",
            }}
          />

          <span className="text-lg font-semibold text-gray-900">
            MCJ Institute
          </span>
        </Link>

        {/* ================= NAVIGATION ================= */}

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href;

            return (
              <button
                key={item.name}
                onClick={() =>
  router.push(
    AUTH_ROUTES.LOGIN
  )
}
                className={`relative pb-1 transition ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {item.name}

                {isActive && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full" />
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
              onClick={() =>
                router.push("/login")
              }
              className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 transition"
            >
              Login
            </button>
          )}

          {/* ================= LOGGED IN ================= */}

          {user && (
            <div className="flex items-center gap-3">
              
              {/* STUDENT BUTTON */}

              <button
                onClick={() =>
                  router.push("/student")
                }
                className="flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 transition"
              >
                <LayoutDashboard className="w-4 h-4" />

                Student
              </button>

              {/* PROFILE MENU */}

              <div
                className="relative"
                onMouseEnter={() =>
                  setOpen(true)
                }
                onMouseLeave={() =>
                  setOpen(false)
                }
              >
                <button className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100 transition">
                  <User className="w-5 h-5 text-gray-700" />
                </button>

                {open && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border rounded-xl shadow-lg p-2 z-50">
                    
                    {/* USER INFO */}

                    <div className="px-3 py-2 text-sm font-semibold text-gray-700 border-b">
                      Logged In
                    </div>

                    {/* DASHBOARD */}

                    <button
                      onClick={() => {
                        router.push(
                          "/student"
                        );

                        setOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-100 rounded-md"
                    >
                      <LayoutDashboard className="w-4 h-4" />

                      Dashboard
                    </button>

                    {/* LOGOUT */}

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md"
                    >
                      <LogOut className="w-4 h-4" />

                      Logout
                    </button>
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