"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import type { PublicBranch } from "@/src/features/branches/types/branch.types";

interface BranchCardProps {
  branch: PublicBranch;
}

function formatLocation(branch: PublicBranch): string {
  return [branch.city, branch.state].filter(Boolean).join(", ") || "—";
}

export function BranchCard({ branch }: BranchCardProps) {
  return (
    <Link href={`/courses?branch=${branch.id}`}>
      <Card className="group h-full rounded-xl border border-slate-200 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-700">
              {branch.branchName}
            </h3>
            <p className="text-sm text-slate-500">{branch.branchCode}</p>
          </div>
          <Badge variant="success">{branch.status}</Badge>
        </div>

        <p className="mt-4 flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-orange-500" />
          {formatLocation(branch)}
        </p>
      </Card>
    </Link>
  );
}
