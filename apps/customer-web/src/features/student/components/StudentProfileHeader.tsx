"use client";

import Image from "next/image";
import { Calendar, Mail, Pencil, Phone, User, UserRound } from "lucide-react";

import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { withImageCacheBust } from "@/src/shared/utils/image-url.util";

import type { StudentProfile } from "@/src/features/student/types";
import {
  formatStudentFullName,
  toFormString,
} from "@/src/features/student/utils/student-profile-form.utils";

interface StudentProfileHeaderProps {
  profile: StudentProfile | null;
  onEdit: () => void;
}

export function StudentProfileHeader({
  profile,
  onEdit,
}: StudentProfileHeaderProps) {
  const authUser = useAuthStore((state) => state.user);
  const fullName = profile
    ? formatStudentFullName(profile.firstName, profile.lastName)
    : toFormString(authUser?.name) || "Account Profile";

  const profileImageUrl =
    profile?.profileImageUrl
      ? withImageCacheBust(profile.profileImageUrl, profile.updatedAt)
      : null;

  return (
    <Card className="animate-fade-up border-0 shadow-sm ring-1 ring-border/50">
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 ring-4 ring-primary/5">
              {profileImageUrl ? (
                <Image
                  src={profileImageUrl}
                  alt={fullName || "Student profile"}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <UserRound className="h-8 w-8 text-primary" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                {fullName}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {profile
                  ? profile.studentCode
                  : "You are signed in. Create a student profile to apply for courses and jobs."}
              </p>
            </div>
          </div>

          <Button onClick={onEdit} className="gap-2 self-start sm:self-auto">
            <Pencil className="h-4 w-4" />
            {profile ? "Update Profile" : "Create Student Profile"}
          </Button>
        </div>

        {profile ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <InfoItem
              icon={<User className="h-3.5 w-3.5" />}
              label="Full Name"
              value={fullName}
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
        ) : authUser ? (
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <InfoItem
              icon={<User className="h-3.5 w-3.5" />}
              label="Account Name"
              value={authUser.name}
            />
            <InfoItem
              icon={<Mail className="h-3.5 w-3.5" />}
              label="Account Email"
              value={authUser.email}
            />
            <InfoItem
              icon={<Phone className="h-3.5 w-3.5" />}
              label="Account Phone"
              value={authUser.phone}
            />
          </div>
        ) : null}
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
  const display = toFormString(value);

  return (
    <div className="rounded-lg border border-border/70 p-4 transition-colors duration-200 hover:border-primary/40 hover:bg-primary/[0.03]">
      <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className="break-words text-sm font-semibold text-foreground">
        {display || (
          <span className="font-normal text-muted-foreground/50">
            Not provided
          </span>
        )}
      </p>
    </div>
  );
}
