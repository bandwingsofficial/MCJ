"use client";

import { useState } from "react";
import { FileText, Pencil, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  BRANCH_ICON_BUTTON_CLASS,
  BRANCH_ICON_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-section";
import { BRANCH_PRIMARY_BUTTON_CLASS } from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import {
  BranchManageTableShell,
  TABLE_CELL_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
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

const DOCUMENT_COLUMNS = [
  { key: "name", label: "Document Name" },
  { key: "type", label: "Document Type" },
  { key: "file", label: "File Name" },
  { key: "date", label: "Uploaded Date" },
  { key: "size", label: "File Size" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", className: "w-24 text-right" },
];

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
    <div className="space-y-3">
      <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
            Documents
          </h2>
          <p className="text-xs text-[#647A9B] sm:text-[13px]">
            Files uploaded for {student.studentCode}
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className={BRANCH_PRIMARY_BUTTON_CLASS}
        >
          <Plus className="mr-1.5 h-4 w-4 shrink-0" />
          Add Document
        </Button>
      </div>

      {error ? (
        <Card className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
          <p className="text-sm text-red-800">{error}</p>
        </Card>
      ) : null}

      <BranchManageTableShell
        columns={DOCUMENT_COLUMNS}
        isLoading={isLoading}
        isEmpty={!isLoading && documents.length === 0}
        emptyTitle="No documents uploaded"
        emptyDescription="Add a document to keep student files with this profile."
        emptyIcon={FileText}
      >
        {documents.map((document) => (
          <tr
            key={document.id}
            className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
          >
            <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
              {document.name}
            </td>
            <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
              {formatStudentDocumentType(document.type)}
            </td>
            <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
              {document.fileUrl ? (
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 font-medium text-[#2563EB] hover:underline"
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
            </td>
            <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
              {formatStudentDate(document.createdAt)}
            </td>
            <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
              {formatStudentFileSize(document.fileSize)}
            </td>
            <td className={TABLE_CELL_CLASS}>
              <Badge variant="success" className="px-2 py-0.5 text-xs">
                Uploaded
              </Badge>
            </td>
            <td className={`${TABLE_CELL_CLASS} text-right`}>
              <div className="flex items-center justify-end gap-2">
                <Tooltip content="Edit document">
                  <button
                    type="button"
                    onClick={() => setEditTarget(document)}
                    aria-label="Edit document"
                    className={`${BRANCH_ICON_BUTTON_CLASS} text-[#2563EB]`}
                  >
                    <Pencil className={BRANCH_ICON_CLASS} />
                  </button>
                </Tooltip>
                <Tooltip content="Delete document">
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(document)}
                    aria-label="Delete document"
                    className={`${BRANCH_ICON_BUTTON_CLASS} text-red-800`}
                  >
                    <Trash2 className={BRANCH_ICON_CLASS} />
                  </button>
                </Tooltip>
              </div>
            </td>
          </tr>
        ))}
      </BranchManageTableShell>

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
