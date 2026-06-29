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
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <>
      <style>{`
        .stu-nav-item {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 9px 12px;
          border-radius: 9px;
          margin-bottom: 2px;
          text-decoration: none;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: -0.005em;
          transition: none;
        }

        /* INACTIVE */
        .stu-nav-item.inactive {
          color: #78716C;
          background: transparent;
        }
        .stu-nav-item.inactive .stu-nav-icon {
          color: #C4B5A5;
        }

        /* ACTIVE — the signature: warm amber left bar + soft tinted pill */
        .stu-nav-item.active {
          background: #FFFBEB;
          color: #92400E;
          font-weight: 600;
          border-left: 2.5px solid #F59E0B;
        }
        .stu-nav-item.active .stu-nav-icon {
          color: #D97706;
        }

        .stu-nav-icon {
          width: 15px;
          height: 15px;
          flex-shrink: 0;
        }
      `}</style>

      <Link
        href={href}
        className={cn("stu-nav-item", isActive ? "active" : "inactive")}
      >
        <Icon className="stu-nav-icon" />
        <span>{label}</span>
      </Link>
    </>
  );
}