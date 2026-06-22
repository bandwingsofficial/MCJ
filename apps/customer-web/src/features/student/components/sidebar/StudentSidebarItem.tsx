"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

interface StudentSidebarItemProps {
  href: string;

  label: string;

  icon: LucideIcon;
}

export function StudentSidebarItem({
  href,
  label,
  icon: Icon,
}: StudentSidebarItemProps) {
  const pathname =
    usePathname();

  const isActive =
    pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-slate-900 text-white shadow-sm shadow-slate-900/10"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      )}
    >
      <Icon className={cn(
        "h-4 w-4 transition-colors",
        isActive ? "text-white" : "text-slate-400 group-hover:text-slate-600"
      )} />

      <span>{label}</span>
    </Link>
  );
}