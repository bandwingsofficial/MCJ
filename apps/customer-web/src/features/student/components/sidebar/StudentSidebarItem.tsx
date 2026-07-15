"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

interface StudentSidebarItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export function StudentSidebarItem({
  href,
  icon: Icon,
  label,
}: StudentSidebarItemProps) {
  const pathname = usePathname();

  // Exact match for the dashboard root, prefix match for nested routes
  // so e.g. /student/profile/edit still highlights "Profile".
  const isActive =
    href === "/student"
      ? pathname === href
      : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`stu-nav-item${isActive ? " is-active" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="stu-nav-icon" strokeWidth={2} />
      <span>{label}</span>
      {isActive && <span className="stu-nav-indicator" />}
    </Link>
  );
}