"use client";

import { MapPin } from "lucide-react";

import type { Batch } from "@/src/features/batches/types/batch.types";

interface EnrollmentBranchInfoProps {
  batch: Batch | null;
}

export function EnrollmentBranchInfo({
  batch,
}: EnrollmentBranchInfoProps) {
  const branchName = batch?.branch?.branchName?.trim();
  const branchCode = batch?.branch?.branchCode?.trim();

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">Branch</h3>
      <p className="mt-1 text-sm text-slate-500">
        This batch is offered at the following branch.
      </p>

      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
            <MapPin className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="font-semibold text-slate-900">
              {branchName || "Not assigned"}
            </p>
            {branchCode ? (
              <p className="mt-1 text-sm text-slate-600">{branchCode}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
