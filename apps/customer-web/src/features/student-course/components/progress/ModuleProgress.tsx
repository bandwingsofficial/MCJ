import {
  CheckCircle2,
  Layers3,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { Progress } from "@/src/shared/components/ui/progress";

interface ModuleProgressProps {
  moduleTitle: string;

  completedLessons: number;

  totalLessons: number;

  progressPercentage: number;
}

export function ModuleProgress({
  moduleTitle,
  completedLessons,
  totalLessons,
  progressPercentage,
}: ModuleProgressProps) {
  const isCompleted =
    progressPercentage === 100;

  return (
    <Card className="space-y-5 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Layers3 className="h-10 w-10 rounded-lg bg-primary/10 p-2 text-primary" />

          <div>
            <h3 className="font-semibold">
              {moduleTitle}
            </h3>

            <p className="text-sm text-muted-foreground">
              {completedLessons} of{" "}
              {totalLessons} lessons
              completed
            </p>
          </div>
        </div>

        <Badge
          variant={
            isCompleted
              ? "success"
              : "info"
          }
        >
          {progressPercentage}%
        </Badge>
      </div>

      <Progress
        value={progressPercentage}
        className="h-2.5"
      />

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-green-600" />

          <span>
            {completedLessons} Lessons
            Completed
          </span>
        </div>

        <span className="font-medium">
          {totalLessons} Total
        </span>
      </div>
    </Card>
  );
}