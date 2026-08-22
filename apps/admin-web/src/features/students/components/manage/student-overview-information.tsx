"use client";

import Image from "next/image";

import { Card } from "@/src/shared/components/ui/card";

import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import {
  formatStudentName,
  getStudentInitials,
} from "@/src/features/students/utils/student-overview.utils";

interface Props {
  student: Student;
  branchName: string;
}

function InfoField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export function StudentOverviewInformation({ student, branchName }: Props) {
  const isArchived = Boolean(student.deletedAt || student.isDeleted);
  const fullName = formatStudentName(student.firstName, student.lastName);

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">
        Student Information
      </h2>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        {student.profileImageUrl ? (
          <Image
            src={student.profileImageUrl}
            alt={fullName}
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-violet-100 text-xl font-semibold text-violet-700">
            {getStudentInitials(student.firstName, student.lastName)}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-lg font-semibold text-slate-900">{fullName}</p>
          <p className="mt-0.5 text-sm text-slate-500">{student.studentCode}</p>
          <div className="mt-2">
            <StudentStatusBadge
              status={student.status}
              isActive={student.isActive}
              isDeleted={isArchived}
            />
          </div>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InfoField label="Full Name">{fullName}</InfoField>
        <InfoField label="Student Code">{student.studentCode}</InfoField>
        <InfoField label="Email">{student.email ?? "—"}</InfoField>
        <InfoField label="Phone">{student.phone ?? "—"}</InfoField>
        <InfoField label="Gender">{student.gender ?? "—"}</InfoField>
        <InfoField label="Date of Birth">
          {formatStudentDate(student.dateOfBirth)}
        </InfoField>
        <InfoField label="Branch">{branchName}</InfoField>
        <InfoField label="Admission Date">
          {formatStudentDate(student.admissionDate)}
        </InfoField>
        <InfoField label="Status">
          <StudentStatusBadge
            status={student.status}
            isActive={student.isActive}
            isDeleted={isArchived}
          />
        </InfoField>
      </dl>
    </Card>
  );
}
