"use client";

import {
  Phone,
  ShieldAlert,
  StickyNote,
  UserRound,
} from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import type { StudentProfile } from "@/src/features/student/types";

interface StudentProfileGuardianProps {
  profile: StudentProfile | null;
}

export function StudentProfileGuardian({
  profile,
}: StudentProfileGuardianProps) {
  return (
    <Card className="border-0 shadow-sm">
      <div className="p-6 space-y-8">
        {/* Parent / Guardian */}

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Parent / Guardian Details
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Parent or guardian contact information.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <InfoItem
              icon={
                <UserRound className="h-4 w-4" />
              }
              label="Parent Name"
              value={profile?.parentName}
            />

            <InfoItem
              icon={
                <Phone className="h-4 w-4" />
              }
              label="Parent Phone"
              value={profile?.parentPhone}
            />
          </div>
        </section>

        {/* Emergency Contact */}

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Emergency Contact
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Contact person in case of emergency.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <InfoItem
              icon={
                <ShieldAlert className="h-4 w-4" />
              }
              label="Emergency Contact Name"
              value={
                profile?.emergencyContactName
              }
            />

            <InfoItem
              icon={
                <Phone className="h-4 w-4" />
              }
              label="Emergency Contact Phone"
              value={
                profile?.emergencyContactPhone
              }
            />
          </div>
        </section>

        {/* Notes */}

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">
              Additional Notes
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Extra information provided by the student.
            </p>
          </div>

          <div className="rounded-lg border bg-muted/20 p-5">
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <StickyNote className="h-4 w-4" />

              <span>Notes</span>
            </div>

            <p className="whitespace-pre-wrap text-sm leading-6">
              {profile?.notes || "-"}
            </p>
          </div>
        </section>
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