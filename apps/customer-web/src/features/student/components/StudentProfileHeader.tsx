"use client";

import { Calendar, Mail, Pencil, Phone, User, UserRound } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type { StudentProfile } from "@/src/features/student/types";

interface StudentProfileHeaderProps {
  profile: StudentProfile | null;
  onEdit: () => void;
}

export function StudentProfileHeader({
  profile,
  onEdit,
}: StudentProfileHeaderProps) {
  return (
    <Card className="animate-fade-up border-0 shadow-sm ring-1 ring-border/50">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-4 ring-primary/5">
              <UserRound className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {profile ? `${profile.firstName} ${profile.lastName}` : "Student Profile"}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {profile
                  ? profile.studentCode
                  : "Manage your personal, educational and guardian information."}
              </p>
            </div>
          </div>

          <Button onClick={onEdit} className="gap-2 self-start sm:self-auto">
            <Pencil className="h-4 w-4" />
            {profile ? "Update Profile" : "Create Profile"}
          </Button>
        </div>

        {profile && (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <InfoItem
              icon={<User className="h-3.5 w-3.5" />}
              label="Full Name"
              value={`${profile.firstName} ${profile.lastName}`}
            />
            <InfoItem
              icon={<User className="h-3.5 w-3.5" />}
              label="Student Code"
              value={profile.studentCode}
            />
            <InfoItem
              icon={<Mail className="h-3.5 w-3.5" />}
              label="Email"
              value={profile.email}
            />
            <InfoItem
              icon={<Phone className="h-3.5 w-3.5" />}
              label="Phone"
              value={profile.phone}
            />
            <InfoItem
              icon={<User className="h-3.5 w-3.5" />}
              label="Gender"
              value={profile.gender}
            />
            <InfoItem
              icon={<Calendar className="h-3.5 w-3.5" />}
              label="Date of Birth"
              value={
                profile.dateOfBirth
                  ? new Date(profile.dateOfBirth).toLocaleDateString()
                  : undefined
              }
            />
          </div>
        )}
      </div>
    </Card>
  );
}

interface InfoItemProps {
  icon?: React.ReactNode;
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