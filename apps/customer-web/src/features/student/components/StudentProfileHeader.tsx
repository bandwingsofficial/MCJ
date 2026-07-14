"use client";

import { Calendar, Mail, Phone, User, UserRound } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";

import type { StudentProfile } from "@/src/features/student/types";

interface StudentProfileHeaderProps {
  profile: StudentProfile | null;
}

export function StudentProfileHeader({
  profile,
}: StudentProfileHeaderProps) {
  return (
    <Card className="mb-6 border-0 shadow-sm">
      <div className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            <UserRound className="h-10 w-10 text-primary" />
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              Student Profile
            </h1>

            <p className="mt-2 text-sm text-muted-foreground">
              Manage your personal, educational and guardian information.
            </p>

            {profile && (
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <InfoItem
                  icon={<User className="h-4 w-4" />}
                  label="Full Name"
                  value={`${profile.firstName} ${profile.lastName}`}
                />

                <InfoItem
                  label="Student Code"
                  value={profile.studentCode}
                />

                <InfoItem
                  icon={<Mail className="h-4 w-4" />}
                  label="Email"
                  value={profile.email}
                />

                <InfoItem
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone"
                  value={profile.phone}
                />

                <InfoItem
                  label="Gender"
                  value={profile.gender}
                />

                <InfoItem
                  icon={<Calendar className="h-4 w-4" />}
                  label="Date of Birth"
                  value={
                    profile.dateOfBirth
                      ? new Date(
                          profile.dateOfBirth,
                        ).toLocaleDateString()
                      : "-"
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

interface InfoItemProps {
  icon?: React.ReactNode;
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