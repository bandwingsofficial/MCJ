"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Hash, MapPin } from "lucide-react";

import type { PublicBranch } from "@/src/features/branches/types/branch.types";
import {
  formatBranchAddress,
  formatBranchLocation,
  getBranchDetailPath,
} from "@/src/features/branches/utils/branch.utils";
import { cn } from "@/src/shared/lib/cn";

interface BranchDiscoveryCardProps {
  branch: PublicBranch;
  className?: string;
}

export function BranchDiscoveryCard({
  branch,
  className,
}: BranchDiscoveryCardProps) {
  const imageUrl = branch.thumbnailUrl?.trim() || null;
  const location = formatBranchLocation(branch);
  const address =
    branch.addressLine1?.trim() ||
    formatBranchAddress(branch) ||
    null;
  const isActive = String(branch.status ?? "").toUpperCase() === "ACTIVE";

  return (
    <article
      className={cn(
        "group flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(11,31,58,0.04)] transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/25 hover:shadow-[0_16px_32px_rgba(11,31,58,0.08)]",
        className,
      )}
    >
      <Link
        href={getBranchDetailPath(branch)}
        className="flex h-full min-w-0 flex-col outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-slate-100">
          {imageUrl ? (
            <>
              <Image
                src={imageUrl}
                alt={branch.branchName}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/55 via-[#0B1F3A]/10 to-transparent" />
            </>
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EEF4FF] via-[#F8FBFF] to-[#F5F3FF]">
              <span className="rounded-lg border border-[#BFDBFE] bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#2563EB]">
                {branch.branchCode}
              </span>
            </div>
          )}

          {isActive ? (
            <span className="absolute left-3 top-3 rounded-md border border-white/40 bg-white/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700 shadow-sm">
              Active
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-bold tracking-tight text-[#0B1F3A] transition-colors group-hover:text-[#2563EB]">
              {branch.branchName}
            </h3>
            {location ? (
              <p className="mt-1.5 flex items-start gap-1.5 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
                <span className="line-clamp-1">{location}</span>
              </p>
            ) : null}
          </div>

          {address ? (
            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-500">
              {address}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {branch.branchCode ? (
              <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-[#F8FBFF] px-2 py-1 text-[11px] font-medium text-[#0B1F3A]">
                <Hash className="h-3 w-3 text-[#2563EB]" />
                {branch.branchCode}
              </span>
            ) : null}
            {branch.city?.trim() ? (
              <span className="inline-flex items-center rounded-md border border-[#E0E7FF] bg-[#F5F3FF]/70 px-2 py-1 text-[11px] font-medium text-[#4338CA]">
                {branch.city.trim()}
              </span>
            ) : null}
          </div>

          <div className="mt-auto pt-5">
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2563EB]">
              View Branch
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
