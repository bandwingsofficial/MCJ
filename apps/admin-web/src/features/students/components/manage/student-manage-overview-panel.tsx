"use client";

import { FileText } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { StudentOverviewInformation } from "@/src/features/students/components/manage/student-overview-information";
import { useStudentDocuments } from "@/src/features/students/hooks/useStudentDocuments";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import { formatStudentDocumentType } from "@/src/features/students/utils/student-document.utils";

import type { TabKey } from "./student-manage-workspace";

interface Props {
  student: Student;
  refreshKey?: number;
  onNavigateToTab: (tab: TabKey) => void;
  onStudentRefresh?: () => Promise<void>;
}

export function StudentManageOverviewPanel({
  student,
  refreshKey = 0,
  onNavigateToTab,
}: Props) {
  const { documents, isLoading } = useStudentDocuments({
    studentId: student.id,
    refreshKey,
  });
  const previewDocuments = documents.slice(0, 3);

  return (
    <div className="space-y-6">
      <StudentOverviewInformation student={student} />

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#102A56]">Documents</h2>
          <button
            type="button"
            onClick={() => onNavigateToTab("documents")}
            className="text-sm font-medium text-[#2563EB] hover:underline"
          >
            View all
          </button>
        </div>

        {isLoading ? (
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
                className="rounded-xl border border-slate-200 bg-slate-50/40 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB]">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-[#102A56]">
                      {document.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatStudentDocumentType(document.type)}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Added on {formatStudentDate(document.createdAt)}
                    </p>
                    <div className="mt-2">
                      <Badge
                        variant="success"
                        className="px-2.5 py-0.5 text-sm"
                      >
                        Uploaded
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-10 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No documents uploaded
            </p>
            <p className="mt-1 text-sm text-[#647A9B]">
              Student documents will appear here once uploaded.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
