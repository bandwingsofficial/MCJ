"use client";

import Image from "next/image";
import { Mail, Phone } from "lucide-react";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import type { StudentPortalStudent } from "@/src/features/student-portal/types/student-portal.types";

interface StudentSummaryCardProps {
  student: StudentPortalStudent;
}

export function StudentSummaryCard({ student }: StudentSummaryCardProps) {
  const fullName = `${student.firstName} ${student.lastName}`;

  return (
    <Card className="p-4 shadow-none">
      <div className="flex items-center gap-4">
        {student.profileImageUrl ? (
          <Image
            src={student.profileImageUrl}
            alt={fullName}
            width={64}
            height={64}
            className="rounded-full object-cover"
          />
        ) : (
          <Avatar alt={fullName} fallback={`${student.firstName[0]}${student.lastName[0]}`} />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{fullName}</h2>
            <Badge variant="default">{student.status}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">ID: {student.studentCode}</p>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> {student.email}</div>
            <div className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> {student.phone}</div>
          </div>
        </div>
      </div>
    </Card>
  );
}