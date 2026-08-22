"use client";

import Image from "next/image";
import { Eye, Pencil, Settings2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import { formatCurrency } from "@/src/features/enrollments/utils/format-payment";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { StudentEnrollmentActiveBadge } from "@/src/features/students/components/manage/student-enrollment-active-badge";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  enrollment: Enrollment;
  branchName: string;
  disabled?: boolean;
  onView: (enrollment: Enrollment) => void;
  onEdit: (enrollment: Enrollment) => void;
  onDelete: (enrollment: Enrollment) => void;
}

function formatBatchCode(enrollment: Enrollment): string {
  return enrollment.batch?.code ?? "—";
}

function formatBatchName(enrollment: Enrollment): string {
  return enrollment.batch?.name ?? "—";
}

export function StudentOverviewEnrollmentCard({
  enrollment,
  branchName,
  disabled = false,
  onView,
  onEdit,
  onDelete,
}: Props) {
  const courseTitle = enrollment.course?.title ?? "—";
  const fee = formatCurrency(enrollment.finalAmount);

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/40 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-900">
              {formatBatchCode(enrollment)}
            </p>
            <StudentEnrollmentActiveBadge enrollment={enrollment} />
          </div>
          <p className="mt-1 text-sm font-medium text-slate-800">
            {formatBatchName(enrollment)}
          </p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 xl:grid-cols-4">
            <p>
              <span className="text-slate-500">Course:</span> {courseTitle}
            </p>
            <p>
              <span className="text-slate-500">Branch:</span> {branchName}
            </p>
            <p>
              <span className="text-slate-500">Start:</span>{" "}
              {formatStudentDate(enrollment.batch?.startDate)}
            </p>
            <p>
              <span className="text-slate-500">End:</span>{" "}
              {formatStudentDate(enrollment.batch?.endDate)}
            </p>
          </div>
          <p className="mt-2 text-sm font-medium text-slate-900">Fee: {fee}</p>
        </div>

        <div className="flex shrink-0 items-center gap-1 self-start">
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onView(enrollment)}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            View
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={disabled}
            onClick={() => onEdit(enrollment)}
          >
            <Pencil className="mr-1.5 h-3.5 w-3.5" />
            Edit
          </Button>
          <Dropdown
            trigger={
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={disabled}
                aria-label="More enrollment actions"
              >
                <Settings2 className="h-4 w-4" />
              </Button>
            }
            items={[
              {
                label: "Delete",
                onClick: () => onDelete(enrollment),
                destructive: true,
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

export function StudentOverviewSectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      {title ? (
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
      ) : null}
      <div className={title ? "mt-4" : undefined}>{children}</div>
    </Card>
  );
}
