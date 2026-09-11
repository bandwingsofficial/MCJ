"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { paymentService } from "@/src/features/payments/services/payment.service";
import { StudentOverviewInformation } from "@/src/features/students/components/manage/student-overview-information";
import { StudentOverviewPrimaryMetrics } from "@/src/features/students/components/manage/student-overview-metrics";
import { useStudentDocuments } from "@/src/features/students/hooks/useStudentDocuments";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { formatStudentDocumentType } from "@/src/features/students/utils/student-document.utils";
import {
  computeStudentOverviewStats,
  type StudentOverviewStats,
} from "@/src/features/students/utils/student-overview.utils";

import type { TabKey } from "./student-manage-workspace";

interface Props {
  student: Student;
  refreshKey?: number;
  onNavigateToTab: (tab: TabKey) => void;
}

function SectionCard({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="flex flex-col gap-1.5 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-[#102A56]">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-[#647A9B]">{description}</p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function InlineEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#F8FBFF] text-[#647A9B] ring-1 ring-[#DCE8F5]">
        <FileText className="h-5 w-5" aria-hidden="true" />
      </div>
      <h3 className="text-base font-semibold text-[#102A56]">{title}</h3>
      <p className="mt-1 max-w-md text-sm text-[#647A9B]">{description}</p>
    </div>
  );
}

const EMPTY_STATS: StudentOverviewStats = {
  activeBatchCount: 0,
  totalEnrollments: 0,
  activeCourseCount: 0,
  attendancePercent: null,
  totalPaid: 0,
  pendingDue: 0,
};

export function StudentManageOverviewPanel({
  student,
  refreshKey = 0,
  onNavigateToTab,
}: Props) {
  const { documents, isLoading: documentsLoading } = useStudentDocuments({
    studentId: student.id,
    refreshKey,
  });
  const previewDocuments = documents.slice(0, 3);

  const [stats, setStats] = useState<StudentOverviewStats>(EMPTY_STATS);
  const [statsLoading, setStatsLoading] = useState(true);

  const loadOverviewStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const [enrollmentResponse, paymentResponse] = await Promise.all([
        enrollmentService.getEnrollments({
          studentId: student.id,
          skip: 0,
          take: 100,
        }),
        paymentService.getPayments({
          studentId: student.id,
          skip: 0,
          take: 100,
          sortBy: "createdAt",
          sortOrder: "desc",
        }),
      ]);

      setStats(
        computeStudentOverviewStats(
          parseEnrollmentListResponse(enrollmentResponse).items,
          paymentResponse.items ?? [],
        ),
      );
    } catch {
      setStats(EMPTY_STATS);
    } finally {
      setStatsLoading(false);
    }
  }, [student.id]);

  useEffect(() => {
    void loadOverviewStats();
  }, [loadOverviewStats, refreshKey]);

  return (
    <div className="space-y-4">
      <StudentOverviewPrimaryMetrics stats={stats} isLoading={statsLoading} />

      <StudentOverviewInformation student={student} />

      <SectionCard
        title="Documents"
        description="Recently uploaded student files."
        action={
          <button
            type="button"
            onClick={() => onNavigateToTab("documents")}
            className="text-sm font-medium text-[#2563EB] transition-colors hover:text-[#1D4ED8] hover:underline"
          >
            View all
          </button>
        }
      >
        {documentsLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
            <Skeleton className="h-24 rounded-xl" />
          </div>
        ) : previewDocuments.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {previewDocuments.map((document) => (
              <div
                key={document.id}
                className="rounded-xl border border-[#E8F0FA] bg-gradient-to-br from-[#F8FBFF] to-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <FileText className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[#102A56]">
                      {document.name}
                    </p>
                    <p className="text-xs text-[#647A9B]">
                      {formatStudentDocumentType(document.type)}
                    </p>
                    <p className="mt-1 text-xs text-[#647A9B]">
                      Added on {formatStudentDate(document.createdAt)}
                    </p>
                    <div className="mt-2">
                      <Badge variant="success" className="px-2 py-0.5 text-xs">
                        Uploaded
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <InlineEmptyState
            title="No documents uploaded"
            description="Student documents will appear here once uploaded."
          />
        )}
      </SectionCard>
    </div>
  );
}
