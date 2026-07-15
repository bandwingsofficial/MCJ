"use client";

import { Phone, ShieldAlert, StickyNote, UserRound, Users } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import type { StudentProfile } from "@/src/features/student/types";

interface StudentProfileGuardianProps {
  profile: StudentProfile | null;
}

export function StudentProfileGuardian({
  profile,
}: StudentProfileGuardianProps) {
  return (
    <Card
      className="animate-fade-up border-0 shadow-sm ring-1 ring-border/50"
    >
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold leading-none tracking-tight">
              Guardian &amp; Emergency Details
            </h2>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Parent, guardian and emergency contact information.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Parent / Guardian
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={<UserRound className="h-3.5 w-3.5" />}
                label="Parent Name"
                value={profile?.parentName}
              />
              <InfoItem
                icon={<Phone className="h-3.5 w-3.5" />}
                label="Parent Phone"
                value={profile?.parentPhone}
              />
            </div>
          </div>

          <div className="border-t border-border/60 pt-6">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Emergency Contact
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoItem
                icon={<ShieldAlert className="h-3.5 w-3.5" />}
                label="Emergency Contact Name"
                value={profile?.emergencyContactName}
              />
              <InfoItem
                icon={<Phone className="h-3.5 w-3.5" />}
                label="Emergency Contact Phone"
                value={profile?.emergencyContactPhone}
              />
            </div>
          </div>

          <div className="border-t border-border/60 pt-6">
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <StickyNote className="h-3.5 w-3.5" />
              Additional Notes
            </h3>
            <div className="rounded-lg border border-border/70 p-4">
              <p className="whitespace-pre-wrap text-sm leading-6 text-foreground">
                {profile?.notes || (
                  <span className="text-muted-foreground/50">No notes added.</span>
                )}
              </p>
            </div>
          </div>
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