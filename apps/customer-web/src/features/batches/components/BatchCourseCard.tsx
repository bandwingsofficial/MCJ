"use client";

import { Card } from "@/src/shared/components/ui/card";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

interface BatchCourseCardProps {
  batch: Batch;
}

export function BatchCourseCard({
  batch,
}: BatchCourseCardProps) {
  return (
    <Card className="p-4 bg-white border border-slate-150 rounded-xl shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-50 pb-2 mb-3">
        Course Information
      </h2>

      <div className="grid gap-3 grid-cols-2 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-0.5">
            Course
          </span>
          <p className="font-semibold text-slate-800">{batch.course.title}</p>
        </div>

        <div>
          <span className="text-slate-400 font-medium block mb-0.5">
            Branch
          </span>
          <p className="font-semibold text-slate-800">
            {batch.branch?.branchName ?? "-"}
          </p>
        </div>

        <div>
          <span className="text-slate-400 font-medium block mb-0.5">
            Mode
          </span>
          <p className="font-semibold text-slate-800">{batch.mode}</p>
        </div>

        <div>
          <span className="text-slate-400 font-medium block mb-0.5">
            Status
          </span>
          <p className="font-semibold text-slate-800">{batch.status}</p>
        </div>
      </div>
    </Card>
  );
}