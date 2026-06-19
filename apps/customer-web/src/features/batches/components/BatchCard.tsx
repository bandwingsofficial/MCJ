"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

interface BatchCardProps {
  batch: Batch;
  onView: (id: string) => void;
}

export function BatchCard({
  batch,
  onView,
}: BatchCardProps) {
  return (
    <Card className="flex h-full flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition-all hover:shadow-md">
      <div className="space-y-3">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-slate-900 tracking-tight line-clamp-1">
              {batch.name}
            </h3>
            <p className="text-xs font-medium text-slate-400">
              {batch.code}
            </p>
          </div>

          <Badge
            className="text-[10px] px-2 py-0.5 font-medium shrink-0"
            variant={batch.isFeatured ? "success" : "default"}
          >
            {batch.isFeatured ? "Featured" : "Regular"}
          </Badge>
        </div>

        {/* Info Grid (2-column layout for optimized space) */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 border-t border-slate-50 pt-3 text-xs text-slate-600">
          <div className="col-span-2">
            <span className="text-slate-400 font-medium">Course:</span>{" "}
            <span className="font-medium text-slate-800">{batch.course.title}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Branch:</span>{" "}
            <span className="font-medium text-slate-800">{batch.branch?.branchName ?? "-"}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Mode:</span>{" "}
            <span className="font-medium text-slate-800">{batch.mode}</span>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Capacity:</span>{" "}
            <span className="font-medium text-slate-800">
              {batch.enrolledCount}/{batch.capacity}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-medium">Starts:</span>{" "}
            <span className="font-medium text-slate-800">
              {new Date(batch.startDate).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      <Button
        className="mt-4 w-full h-9 text-xs font-medium rounded-lg"
        onClick={() => onView(batch.id)}
      >
        View Details
      </Button>
    </Card>
  );
}