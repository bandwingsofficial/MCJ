"use client";

import { useState } from "react";
import { FileText, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { useStudentDocuments } from "@/src/features/students/hooks/useStudentDocuments";
import { studentService } from "@/src/features/students/services/student.service";
import type {
  Student,
  StudentDocument,
} from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import {
  formatStudentDocumentType,
  formatStudentFileSize,
} from "@/src/features/students/utils/student-document.utils";

import { StudentDocumentFormModal } from "./student-document-form-modal";

const iconBtnClass =
  "h-9 w-9 shrink-0 rounded-lg p-0 transition-colors";
const iconClass = "h-[1.25rem] w-[1.25rem]";

interface Props {
  student: Student;
  refreshKey?: number;
  onDocumentsChanged?: () => void;
}

export function StudentManageDocumentsPanel({
  student,
  refreshKey = 0,
  onDocumentsChanged,
}: Props) {
  const { documents, isLoading, error, refetch } = useStudentDocuments({
    studentId: student.id,
    refreshKey,
  });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<StudentDocument | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudentDocument | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDocumentsChanged = async () => {
    await refetch();
    onDocumentsChanged?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">Documents</h2>
          <p className="text-sm text-slate-500">
            Files uploaded for {student.studentCode}
          </p>
        </div>
        <Button type="button" onClick={() => setIsAddOpen(true)}>
          + Add Document
        </Button>
      </div>

      {error ? (
        <Card className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm text-red-800">{error}</p>
        </Card>
      ) : null}

      <Card className="overflow-hidden rounded-2xl border border-slate-200/80 p-0 shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : documents.length === 0 ? (
          <div className="rounded-none border-0 p-6">
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-12 text-center">
              <FileText className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-700">
                No documents uploaded
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Add a document to keep student files with this profile.
              </p>
            </div>
          </div>
        ) : (
          <Table className="rounded-none border-0">
            <TableHeader>
              <TableRow>
                <TableHead>Document Name</TableHead>
                <TableHead>Document Type</TableHead>
                <TableHead>File Name</TableHead>
                <TableHead>Uploaded Date</TableHead>
                <TableHead>File Size</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document.id}>
                  <TableCell className="text-[15px] font-medium text-slate-900">
                    {document.name}
                  </TableCell>
                  <TableCell className="text-[15px] text-slate-700">
                    {formatStudentDocumentType(document.type)}
                  </TableCell>
                  <TableCell className="text-[15px] text-slate-700">
                    {document.fileUrl ? (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1.5 font-medium text-[#2447A8] hover:underline"
                        onClick={() => {
                          window.open(
                            document.fileUrl ?? "",
                            "_blank",
                            "noopener,noreferrer",
                          );
                        }}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        {document.fileName ?? "View file"}
                      </button>
                    ) : (
                      (document.fileName ?? "—")
                    )}
                  </TableCell>
                  <TableCell className="text-[15px] text-slate-700">
                    {formatStudentDate(document.createdAt)}
                  </TableCell>
                  <TableCell className="text-[15px] text-slate-700">
                    {formatStudentFileSize(document.fileSize)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="px-2.5 py-0.5 text-sm">
                      Uploaded
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Tooltip content="Edit document">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditTarget(document)}
                          aria-label="Edit document"
                          className={`${iconBtnClass} text-[#2447A8] hover:bg-blue-50 hover:text-[#1E3A8A]`}
                        >
                          <Pencil className={iconClass} />
                        </Button>
                      </Tooltip>
                      <Tooltip content="Delete document">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteTarget(document)}
                          aria-label="Delete document"
                          className={`${iconBtnClass} text-red-600 hover:bg-red-50 hover:text-red-700`}
                        >
                          <Trash2 className={iconClass} />
                        </Button>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <StudentDocumentFormModal
        open={isAddOpen}
        studentId={student.id}
        onClose={() => setIsAddOpen(false)}
        onSuccess={handleDocumentsChanged}
      />

      <StudentDocumentFormModal
        open={Boolean(editTarget)}
        studentId={student.id}
        document={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={handleDocumentsChanged}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete document?"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        loading={isDeleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) {
            return;
          }

          try {
            setIsDeleting(true);
            await studentService.deleteStudentDocument(
              student.id,
              deleteTarget.id,
            );
            appToast.success("Document deleted successfully");
            setDeleteTarget(null);
            await handleDocumentsChanged();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </div>
  );
}
