"use client";

import { Calendar, Users, MapPin, Video } from "lucide-react";
import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";

import type { Batch } from "@/src/features/batches/types/batch.types";

interface BatchCardProps {
  batch: Batch;
  onView: (id: string) => void;
}

export function BatchCard({ batch, onView }: BatchCardProps) {
  const isFull = batch.enrolledCount >= batch.capacity;

  return (
    <Card className="group flex max-w-sm h-full flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div className="space-y-4">
        
        {/* Header Block */}
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
              {batch.name}
            </h3>
            <p className="text-[11px] font-mono tracking-wider uppercase text-muted-foreground/80">
              {batch.code}
            </p>
          </div>

          {batch.isFeatured && (
            <Badge className="text-[10px] bg-yellow-600 hover:bg-yellow-600 text-white font-medium border-none px-2 py-0.5 shrink-0 rounded-md shadow-sm">
              Featured
            </Badge>
          )}
        </div>

        <div className="rounded-lg bg-blue-50/50 border border-blue-100 px-3 py-2 text-xs">
  <span className="text-blue-600 block text-[10px] uppercase tracking-wider font-bold mb-0.5">
    Course Mapping
  </span>
  <span className="font-semibold text-blue-900">{batch.course.title}</span>
</div>

        {/* Clean Structured Metrics Grid */}
        <div className="grid grid-cols-2 gap-y-3.5 gap-x-2 border-t border-border/60 pt-4">
          
          {/* Branch Info */}
          <div className="flex items-center gap-2 text-xs">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="truncate">
              <span className="block text-[10px] text-muted-foreground uppercase font-medium">Branch</span>
              <span className="font-medium text-foreground truncate block">{batch.branch?.branchName ?? "N/A"}</span>
            </div>
          </div>

          {/* Training Delivery Mode */}
          <div className="flex items-center gap-2 text-xs">
            <Video className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-medium">Mode</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{batch.mode.toLowerCase()}</span>
            </div>
          </div>

          {/* Seat Capacity Status */}
          <div className="flex items-center gap-2 text-xs">
            <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-medium">Capacity</span>
              <span className={`font-semibold ${isFull ? "text-destructive" : "text-foreground"}`}>
                {batch.enrolledCount} / {batch.capacity} Slots
              </span>
            </div>
          </div>

          {/* Timeline Calendar Date */}
          <div className="flex items-center gap-2 text-xs">
            <Calendar className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-medium">Starts On</span>
              <span className="font-medium text-foreground">
                {new Date(batch.startDate).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Primary Action Target */}
      <Button
        className="mt-5 w-full h-9 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors"
        onClick={() => onView(batch.id)}
      >
        View Details
      </Button>
    </Card>
  );
}