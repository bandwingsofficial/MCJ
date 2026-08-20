"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useStudent } from "@/src/features/students/hooks/useStudent";
import { useDeleteStudent } from "@/src/features/students/hooks/useDeleteStudent";
import { useRestoreStudent } from "@/src/features/students/hooks/useRestoreStudent";
import { usePermanentDeleteStudent } from "@/src/features/students/hooks/usePermanentDeleteStudent";

import { UpdateStudentModal } from "@/src/features/students/components/update-student-modal";
import { StudentManageHeader } from "@/src/features/students/components/manage/student-manage-header";
import { StudentManageWorkspace } from "@/src/features/students/components/manage/student-manage-workspace";

interface Props {
  studentId: string;
}

export function StudentManagePage({ studentId }: Props) {
  const router = useRouter();
  const { student, isLoading, error, refetch } = useStudent({ id: studentId });

  const { deleteStudent, isPending: isArchiving } = useDeleteStudent();
  const { restoreStudent, isPending: isRestoring } = useRestoreStudent();
  const { permanentDeleteStudent, isPending: isPermanentlyDeleting } =
    usePermanentDeleteStudent();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | undefined>();

  const actionsDisabled =
    isArchiving || isRestoring || isPermanentlyDeleting;

  if (isLoading) {
    return <Loader />;
  }

  if (error || !student) {
    return (
      <ErrorState
        title="Student Not Found"
        description={error ?? "Unable to load this student."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <>
      <StudentManageHeader
        student={student}
        activeSection={activeSection}
        onEdit={() => setIsEditOpen(true)}
        onArchive={() => setIsArchiveOpen(true)}
        onRestore={async () => {
          try {
            await restoreStudent(student.id);
            appToast.success("Student restored successfully");
            await refetch();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
        onPermanentDelete={() => setIsPermanentDeleteOpen(true)}
        actionsDisabled={actionsDisabled}
      />

      <div className="mt-4">
        <StudentManageWorkspace
          student={student}
          onTabChange={(tab) => {
            const labels: Record<string, string> = {
              overview: "Overview",
              enrollments: "Enrollments",
              attendance: "Attendance",
              reports: "Reports",
            };
            setActiveSection(labels[tab]);
          }}
        />
      </div>

      <UpdateStudentModal
        open={isEditOpen}
        student={student}
        onClose={() => setIsEditOpen(false)}
        onSuccess={async () => {
          await refetch();
        }}
      />

      <ConfirmDialog
        open={isArchiveOpen}
        title="Archive student?"
        description={`Archive "${[student.firstName, student.lastName].filter(Boolean).join(" ")}"? They can be restored later.`}
        confirmLabel="Archive"
        loading={isArchiving}
        onCancel={() => setIsArchiveOpen(false)}
        onConfirm={async () => {
          try {
            await deleteStudent(student.id);
            appToast.success("Student archived successfully");
            setIsArchiveOpen(false);
            router.push("/students");
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={isPermanentDeleteOpen}
        title="Permanently delete student?"
        description={`You are about to permanently delete "${[student.firstName, student.lastName].filter(Boolean).join(" ")}". This action cannot be undone.`}
        confirmLabel="Permanently Delete"
        loading={isPermanentlyDeleting}
        onCancel={() => setIsPermanentDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await permanentDeleteStudent(student.id);
            appToast.success("Student permanently deleted");
            setIsPermanentDeleteOpen(false);
            router.push("/students");
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />
    </>
  );
}
