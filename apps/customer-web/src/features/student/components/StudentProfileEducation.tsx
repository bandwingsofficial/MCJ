"use client";

import {
  BookOpen,
  GraduationCap,
  School,
  CalendarDays,
} from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import type { StudentProfile } from "@/src/features/student/types";

interface StudentProfileEducationProps {
  profile: StudentProfile | null;
}

export function StudentProfileEducation({
  profile,
}: StudentProfileEducationProps) {
  return (
    <Card className="border-0 shadow-sm">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold">
            Education Details
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Academic qualification and educational background.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <InfoItem
            icon={
              <GraduationCap className="h-4 w-4" />
            }
            label="Qualification"
            value={profile?.qualification}
          />

          <InfoItem
            icon={
              <School className="h-4 w-4" />
            }
            label="College Name"
            value={profile?.collegeName}
          />

          <InfoItem
            icon={
              <BookOpen className="h-4 w-4" />
            }
            label="Specialization"
            value={profile?.specialization}
          />

          <InfoItem
            icon={
              <CalendarDays className="h-4 w-4" />
            }
            label="Passing Year"
            value={
              profile?.passingYear
                ? String(
                    profile.passingYear,
                  )
                : "-"
            }
          />
        </div>
      </div>
    </Card>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}

function InfoItem({
  icon,
  label,
  value,
}: InfoItemProps) {
  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>

      <p className="break-words text-sm font-semibold">
        {value || "-"}
      </p>
    </div>
  );
}