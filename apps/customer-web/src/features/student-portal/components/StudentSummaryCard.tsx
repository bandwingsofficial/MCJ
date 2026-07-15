"use client";

import Image from "next/image";

import {
  Mail,
  Phone,
  User,
} from "lucide-react";

import { Avatar } from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import type {
  StudentPortalStudent,
} from "@/src/features/student-portal/types/student-portal.types";

interface StudentSummaryCardProps {
  student: StudentPortalStudent;
}

export function StudentSummaryCard({
  student,
}: StudentSummaryCardProps) {
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <Card className="overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <div className="relative">
            {student.profileImageUrl ? (
              <Image
                src={
                  student.profileImageUrl
                }
                alt={fullName}
                width={88}
                height={88}
                className="rounded-full object-cover ring-4 ring-background"
              />
            ) : (
              <div className="h-20 w-20">
                <Avatar
                  alt={fullName}
                  fallback={`${student.firstName[0]}${student.lastName[0]}`}
                />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-2xl font-bold">
                {fullName}
              </h2>

              <Badge variant="success">
                {student.status}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">
              Student Code :
              {" "}
              <span className="font-medium text-foreground">
                {student.studentCode}
              </span>
            </p>

            <div className="grid gap-3 pt-3 md:grid-cols-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-primary" />

                <span>
                  {student.email}
                </span>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-primary" />

                <span>
                  {student.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-background px-5 py-4 text-center">
            <User className="mx-auto mb-2 h-6 w-6 text-primary" />

            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Status
            </p>

            <p className="mt-1 font-semibold">
              {student.status}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}