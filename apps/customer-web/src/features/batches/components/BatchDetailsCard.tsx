"use client";

import { Card } from "@/src/shared/components/ui/card";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

import { BatchCourseCard } from "./BatchCourseCard";
import { BatchScheduleCard } from "./BatchScheduleCard";
import { BatchTrainerCard } from "./BatchTrainerCard";
import { BatchEnrollmentCard } from "./BatchEnrollmentCard";

interface BatchDetailsCardProps {
  batch: Batch;
}

export function BatchDetailsCard({
  batch,
}: BatchDetailsCardProps) {
  return (
    <div className="space-y-4">
      {/* Main Banner Header */}
      <Card className="p-4 bg-white border border-slate-150 rounded-xl shadow-sm">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {batch.name}
          </h1>

          <p className="mt-1 text-xs md:text-sm text-slate-500 max-w-3xl leading-relaxed">
            {batch.description ??
              "No description available."}
          </p>
        </div>
      </Card>

      {/* Modern Dashboard Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div className="md:col-span-2 space-y-4">
          <BatchCourseCard
            batch={batch}
          />

          <BatchScheduleCard
            batch={batch}
          />

          <BatchTrainerCard
            batch={batch}
          />
        </div>

        <div className="md:col-span-1">
          <BatchEnrollmentCard
            batch={batch}
          />
        </div>
      </div>
    </div>
  );
}