"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

interface TrainerSkillsCardProps {
  skills: string[];
}

export function TrainerSkillsCard({
  skills,
}: TrainerSkillsCardProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Skills
        </h3>

        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <Badge
                key={skill}
                variant="info"
              >
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No skills available.
          </p>
        )}
      </div>
    </Card>
  );
}