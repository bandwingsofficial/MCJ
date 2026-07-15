import {
  BookOpen,
  CheckCircle2,
  FileText,
  Layers3,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { Progress } from "@/src/shared/components/ui/progress";

interface CourseProgressProps {
  totalModules: number;
  totalLessons: number;
  totalResources: number;
  progressPercentage: number;
}

export function CourseProgress({
  totalModules,
  totalLessons,
  totalResources,
  progressPercentage,
}: CourseProgressProps) {
  return (
    <Card className="space-y-6 p-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <h2 className="text-xl font-semibold">
            Course Progress
          </h2>

          <p className="text-sm text-muted-foreground">
            Track your learning journey.
          </p>
        </div>

        <Badge
          variant={
            progressPercentage === 100
              ? "success"
              : "info"
          }
        >
          {progressPercentage}% Completed
        </Badge>
      </div>

      <Progress
        value={progressPercentage}
        className="h-3"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex items-center gap-4 p-4">
          <Layers3 className="h-10 w-10 rounded-lg bg-primary/10 p-2 text-primary" />

          <div>
            <p className="text-sm text-muted-foreground">
              Modules
            </p>

            <h3 className="text-2xl font-bold">
              {totalModules}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <BookOpen className="h-10 w-10 rounded-lg bg-blue-500/10 p-2 text-blue-500" />

          <div>
            <p className="text-sm text-muted-foreground">
              Lessons
            </p>

            <h3 className="text-2xl font-bold">
              {totalLessons}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <FileText className="h-10 w-10 rounded-lg bg-amber-500/10 p-2 text-amber-500" />

          <div>
            <p className="text-sm text-muted-foreground">
              Resources
            </p>

            <h3 className="text-2xl font-bold">
              {totalResources}
            </h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4 p-4">
          <CheckCircle2 className="h-10 w-10 rounded-lg bg-green-500/10 p-2 text-green-500" />

          <div>
            <p className="text-sm text-muted-foreground">
              Completion
            </p>

            <h3 className="text-2xl font-bold">
              {progressPercentage}%
            </h3>
          </div>
        </Card>
      </div>
    </Card>
  );
}