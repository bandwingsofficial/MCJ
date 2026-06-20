"use client";

import { Card } from "@/src/shared/components/ui/card";

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

interface ApplicationStudentInfoProps {
  application: JobApplication;
}

export function ApplicationStudentInfo({
  application,
}: ApplicationStudentInfoProps) {
  const student =
    application.student;

  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-lg font-semibold">
        Student Information
      </h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">
            Name
          </p>

          <p>
            {student.firstName}{" "}
            {student.lastName}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Student Code
          </p>

          <p>{student.studentCode}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Email
          </p>

          <p>{student.email}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">
            Phone
          </p>

          <p>{student.phone}</p>
        </div>
      </div>
    </Card>
  );
}