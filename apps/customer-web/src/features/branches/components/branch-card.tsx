"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";

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
    <Link href={getBranchDetailPath(branch)}>
      <Card className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#2563EB]/30 hover:shadow-md">
        <div className="relative h-36 bg-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={branch.branchName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EEF4FF] to-[#F5F3FF] text-sm font-medium text-[#2563EB]">
              {branch.branchCode}
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[#0B1F3A] group-hover:text-[#2563EB]">
                {branch.branchName}
              </h3>
              <p className="text-sm text-slate-500">{branch.branchCode}</p>
            </div>
            <Badge variant="success">{branch.status}</Badge>
          </div>
          <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
            <MapPin className="h-4 w-4 text-[#2563EB]" />
            {formatBranchLocation(branch) || "—"}
          </p>
          <span className="mt-4 inline-flex items-center text-sm font-semibold text-[#2563EB]">
            View Branch
            <ArrowRight className="ml-1 h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </div>
      </Card>
    </Link>
  );
}
