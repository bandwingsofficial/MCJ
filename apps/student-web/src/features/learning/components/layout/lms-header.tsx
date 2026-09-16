"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, GraduationCap } from "lucide-react";

import { env } from "@/src/core/config/env";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { Button } from "@/src/shared/components/ui/button";

interface LmsHeaderProps {
  title?: string;
  subtitle?: string;
}

export function LmsHeader({ title, subtitle }: LmsHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const initials =
    user?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "ST";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/student/learning" className="flex items-center gap-2">
            <Image
              src="/logo/MCJ_logo.png"
              alt="MCJ Academy"
              width={32}
              height={32}
              className="h-8 w-8 rounded-lg"
            />
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-[#0B1F3A]">MCJ Academy</p>
              <p className="text-[11px] text-slate-500">Learning Platform</p>
            </div>
          </Link>
          {title ? (
            <div className="hidden min-w-0 border-l border-slate-200 pl-4 md:block">
              <p className="truncate text-sm font-semibold text-[#0B1F3A]">
                {title}
              </p>
              {subtitle ? (
                <p className="truncate text-xs text-slate-500">{subtitle}</p>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/student/learning">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex">
              <GraduationCap className="mr-2 h-4 w-4" />
              My Courses
            </Button>
          </Link>
          <a href={env.CUSTOMER_WEB_URL} target="_self" rel="noreferrer">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-4 w-4" />
              Back to Website
            </Button>
          </a>
          <Avatar alt={user?.name ?? "Student"} fallback={initials} />
        </div>
      </div>
    </header>
  );
}
