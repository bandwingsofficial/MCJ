
"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin, Building2 } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import type { PublicBranch } from "@/src/features/branches/types/branch.types";
import {
  formatBranchLocation,
  getBranchDetailPath,
} from "@/src/features/branches/utils/branch.utils";

interface BranchCardProps {
  branch: PublicBranch;
}

export function BranchCard({ branch }: BranchCardProps) {
  const imageUrl = branch.thumbnailUrl;

  return (
    <Link
      href={getBranchDetailPath(branch)}
      className="block h-full outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-4 rounded-2xl"
    >
      <Card className="group h-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#2563EB]/40 hover:shadow-xl">
        {/* Branch Image */}
        <div className="relative h-44 w-full overflow-hidden bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={branch.branchName}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EEF4FF] to-[#F5F3FF]">
              <div className="flex flex-col items-center gap-2 text-[#2563EB]">
                <Building2 className="h-9 w-9" strokeWidth={1.5} />
                <span className="text-sm font-semibold">
                  {branch.branchCode}
                </span>
              </div>
            </div>
          )}

          {/* Image Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/45 via-transparent to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-100" />

          {/* Branch Code */}
          <div className="absolute bottom-3 left-4">
            <span className="rounded-lg border border-white/20 bg-[#0B1F3A]/75 px-3 py-1.5 text-[10px] font-bold tracking-wider text-white backdrop-blur-sm">
              {branch.branchCode}
            </span>
          </div>
        </div>

        {/* Branch Details */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg font-bold leading-snug text-[#0B1F3A] transition-colors duration-200 group-hover:text-[#2563EB]">
              {branch.branchName}
            </h3>

            <Badge variant="success" className="shrink-0">
              {branch.status}
            </Badge>
          </div>

          {/* Location */}
          <div className="mt-4 flex min-h-10 items-start gap-2.5">
            <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
              <MapPin className="h-4 w-4" />
            </div>

            <p className="text-sm leading-6 text-slate-600">
              {formatBranchLocation(branch) || "Location details unavailable"}
            </p>
          </div>

          {/* View Branch */}
          <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-bold text-[#2563EB]">
              Explore Branch
            </span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-[#2563EB] transition-all duration-300 group-hover:bg-[#2563EB] group-hover:text-white">
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
