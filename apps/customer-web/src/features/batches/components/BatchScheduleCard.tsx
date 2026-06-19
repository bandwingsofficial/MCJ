"use client";

import { Card } from "@/src/shared/components/ui/card";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

interface BatchScheduleCardProps {
  batch: Batch;
}

export function BatchScheduleCard({
  batch,
}: BatchScheduleCardProps) {
  return (
    <Card className="p-4 bg-white border border-slate-150 rounded-xl shadow-sm">
      <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-50 pb-2 mb-3">
        Schedule
      </h2>

      <div className="grid gap-3 grid-cols-2 text-xs">
        <div>
          <span className="text-slate-400 font-medium block mb-0.5">
            Start Date
          </span>
          <p className="font-semibold text-slate-800">
            {new Date(batch.startDate).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>

        <div>
          <span className="text-slate-400 font-medium block mb-0.5">
            End Date
          </span>
          <p className="font-semibold text-slate-800">
            {batch.endDate
              ? new Date(batch.endDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "-"}
          </p>
        </div>

        <div>
          <span className="text-slate-400 font-medium block mb-0.5">
            Time
          </span>
          <p className="font-semibold text-slate-800">
            {batch.startTime} - {batch.endTime}
          </p>
        </div>

        <div>
          <span className="text-slate-400 font-medium block mb-0.5">
            Days
          </span>
          <p className="font-semibold text-slate-800 line-clamp-1">
            {batch.daysOfWeek.join(", ")}
          </p>
        </div>
      </div>
    </Card>
  );
}