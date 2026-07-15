import {
  Award,
  CheckCircle2,
} from "lucide-react";

import { useMemo } from "react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Separator } from "@/src/shared/components/ui/separator";

import type {
  CourseModule,
} from "@/src/features/student-course/types/module.types";

interface KeySkillsProps {
  modules: CourseModule[];
}

export function KeySkills({
  modules,
}: KeySkillsProps) {
  const skills = useMemo(() => {
    return [
      ...new Set(
        modules.flatMap(
          (module) =>
            module.keySkills,
        ),
      ),
    ].sort();
  }, [modules]);

  return (
    <Card className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Award className="h-6 w-6 text-primary" />

        <div>
          <h2 className="text-xl font-semibold">
            Key Skills
          </h2>

          <p className="text-sm text-muted-foreground">
            Skills you will develop during this course.
          </p>
        </div>
      </div>

      <Separator />

      {skills.length === 0 ? (
        <EmptyState
          title="No Skills Available"
          description="Key skills haven't been added for this course yet."
        />
      ) : (
        <div className="flex flex-wrap gap-3">
          {skills.map(
            (skill) => (
              <Badge
                key={skill}
                variant="success"
                className="gap-2 px-4 py-2 text-sm"
              >
                <CheckCircle2 className="h-4 w-4" />

                {skill}
              </Badge>
            ),
          )}
        </div>
      )}
    </Card>
  );
}