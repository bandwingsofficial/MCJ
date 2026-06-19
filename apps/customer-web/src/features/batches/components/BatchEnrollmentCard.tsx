"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

interface BatchEnrollmentCardProps {
  batch: Batch;
}

export function BatchEnrollmentCard({
  batch,
}: BatchEnrollmentCardProps) {
  const seatsLeft = batch.capacity - batch.enrolledCount;

  return (
    <Card className="p-4 bg-white border border-slate-150 rounded-xl shadow-sm sticky top-4">
      <h2 className="text-sm font-semibold text-slate-900 border-b border-slate-50 pb-2 mb-3">
        Enrollment
      </h2>

      <div className="space-y-2 mb-4 text-xs">
        <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
          <span className="text-slate-400 font-medium">Capacity</span>
          <span className="font-semibold text-slate-800">{batch.capacity}</span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-50 pb-1.5">
          <span className="text-slate-400 font-medium">Enrolled</span>
          <span className="font-semibold text-slate-800">{batch.enrolledCount}</span>
        </div>

        <div className="flex justify-between items-center pt-0.5">
          <span className="text-slate-400 font-medium">Seats Available</span>
          <span className={`font-bold ${seatsLeft > 0 ? "text-emerald-600" : "text-rose-500"}`}>
            {seatsLeft}
          </span>
        </div>
      </div>

      <Button
        className="w-full h-9 text-xs font-medium rounded-lg"
        disabled={seatsLeft <= 0}
      >
        {seatsLeft > 0 ? "Enroll Now" : "Batch Full"}
      </Button>
    </Card>
  );
}