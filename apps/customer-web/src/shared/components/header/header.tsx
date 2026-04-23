"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Jobs", href: "/jobs" },
  { name: "Courses", href: "/courses" },
  { name: "Franchise", href: "/franchise" },
  { name: "Finance News", href: "/finance-news" },
  { name: "Contact Us", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* LOGO + NAME */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo/MCJ_logo.png"
            alt="MCJ Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
          />

          <span className="text-lg font-semibold text-gray-900">
            MCJ Institute
          </span>
        </Link>

        {/* NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative pb-1 transition ${
                  isActive
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-black"
                }`}
              >
                {item.name}

                {/* ACTIVE UNDERLINE */}
                {isActive && (
                  <span className="absolute left-0 bottom-0 w-full h-[2px] bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* PROFILE ICON */}
        <div className="flex items-center">
          <button className="w-10 h-10 flex items-center justify-center rounded-full border hover:bg-gray-100 transition">
            <User className="w-5 h-5 text-gray-700" />
          </button>
        </div>

      </div>
    </header>
  );
}