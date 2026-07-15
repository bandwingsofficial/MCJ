"use client";

import { BookOpen, CalendarDays, GraduationCap, School } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import type { StudentProfile } from "@/src/features/student/types";

interface StudentProfileEducationProps {
  profile: StudentProfile | null;
}

export function StudentProfileEducation({
  profile,
}: StudentProfileEducationProps) {
  return (
    <Card
      className="animate-fade-up border-0 shadow-sm ring-1 ring-border/50"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-none tracking-tight">
              Education Details
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Academic qualification and educational background.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoItem
            icon={<GraduationCap className="h-3.5 w-3.5" />}
            label="Qualification"
            value={profile?.qualification}
          />
          <InfoItem
            icon={<School className="h-3.5 w-3.5" />}
            label="College Name"
            value={profile?.collegeName}
          />
          <InfoItem
            icon={<BookOpen className="h-3.5 w-3.5" />}
            label="Specialization"
            value={profile?.specialization}
          />
          <InfoItem
            icon={<CalendarDays className="h-3.5 w-3.5" />}
            label="Passing Year"
            value={profile?.passingYear ? String(profile.passingYear) : undefined}
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

function InfoItem({ icon, label, value }: InfoItemProps) {
  return (
    <div className="rounded-lg border border-border/70 p-4 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/[0.03]">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="break-words text-sm font-semibold text-foreground">
        {value || <span className="font-normal text-muted-foreground/50">Not provided</span>}
      </p>
    </div>
  );
}