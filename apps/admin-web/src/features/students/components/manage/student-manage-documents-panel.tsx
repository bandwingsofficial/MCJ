"use client";

import { Download, FileImage, FileText } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  student: Student;
}

export function StudentManageDocumentsPanel({ student }: Props) {
  const profileDocument = student.profileImageUrl
    ? {
        title: "Profile Photo",
        fileName: "profile-photo",
        addedOn: student.updatedAt,
        url: student.profileImageUrl,
      }
    : null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold text-slate-900">Documents</h2>
        <p className="text-sm text-slate-500">
          Files uploaded for {student.studentCode}
        </p>
      </div>

      {profileDocument ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Card className="rounded-2xl border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-600">
                <FileImage className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  {profileDocument.title}
                </p>
                <p className="text-xs text-slate-500">
                  {profileDocument.fileName}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Added on {formatStudentDate(profileDocument.addedOn)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-4 w-full"
              onClick={() => {
                window.open(profileDocument.url, "_blank", "noopener,noreferrer");
              }}
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Download
            </Button>
          </Card>
        </div>
      ) : (
        <Card className="rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No documents uploaded
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Student documents will appear here once uploaded.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}
