"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { useStudent } from "@/src/features/students/hooks/useStudent";
import { useActivateStudent } from "@/src/features/students/hooks/useActivateStudent";
import { useDeactivateStudent } from "@/src/features/students/hooks/useDeactivateStudent";
import { useDeleteStudent } from "@/src/features/students/hooks/useDeleteStudent";
import { useRestoreStudent } from "@/src/features/students/hooks/useRestoreStudent";
import { usePermanentDeleteStudent } from "@/src/features/students/hooks/usePermanentDeleteStudent";

import { UpdateStudentModal } from "@/src/features/students/components/update-student-modal";
import { StudentManageHeader } from "@/src/features/students/components/manage/student-manage-header";
import {
  StudentManageWorkspace,
  type TabKey,
} from "@/src/features/students/components/manage/student-manage-workspace";
import {
  STUDENT_MANAGE_DEFAULT_TAB,
  studentManagePath,
  studentManageTabPath,
} from "@/src/features/students/utils/student-manage.routes";

interface Props {
  studentId: string;
  initialTab?: TabKey;
}

const TAB_LABELS: Record<TabKey, string> = {
  overview: "Overview",
  enrollments: "Enrollments",
  attendance: "Attendance",
  payments: "Payments",
  documents: "Documents",
  activity: "Activity",
};

const VALID_TABS = new Set<TabKey>(Object.keys(TAB_LABELS) as TabKey[]);

function resolveInitialTab(initialTab?: TabKey): TabKey {
  if (initialTab && VALID_TABS.has(initialTab)) {
    return initialTab;
  }

  return STUDENT_MANAGE_DEFAULT_TAB;
}

export function StudentManagePage({ studentId, initialTab }: Props) {
  const router = useRouter();
  const { student, isLoading, error, refetch } = useStudent({ id: studentId });

  const { activateStudent, isLoading: isActivating } = useActivateStudent();
  const { deactivateStudent, isLoading: isDeactivating } = useDeactivateStudent();
  const { deleteStudent, isPending: isArchiving } = useDeleteStudent();
  const { restoreStudent, isPending: isRestoring } = useRestoreStudent();
  const { permanentDeleteStudent, isPending: isPermanentlyDeleting } =
    usePermanentDeleteStudent();

  const [activeTab, setActiveTab] = useState<TabKey>(
    resolveInitialTab(initialTab),
  );
  const [overviewRefreshKey, setOverviewRefreshKey] = useState(0);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] = useState(false);

  useEffect(() => {
    setActiveTab(resolveInitialTab(initialTab));
  }, [initialTab]);

  const refreshStudentData = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const bumpOverviewRefresh = useCallback(() => {
    setOverviewRefreshKey((current) => current + 1);
  }, []);

  const handleStudentDataRefresh = useCallback(async () => {
    bumpOverviewRefresh();
    await refreshStudentData();
  }, [bumpOverviewRefresh, refreshStudentData]);

  const returnToOverview = useCallback(async () => {
    setActiveTab(STUDENT_MANAGE_DEFAULT_TAB);
    bumpOverviewRefresh();
    await refreshStudentData();
    router.replace(studentManagePath(studentId));
  }, [bumpOverviewRefresh, refreshStudentData, router, studentId]);

  const returnToEnrollmentsTab = useCallback(async () => {
    setActiveTab("enrollments");
    bumpOverviewRefresh();
    await refreshStudentData();
    router.replace(studentManageTabPath(studentId, "enrollments"));
  }, [bumpOverviewRefresh, refreshStudentData, router, studentId]);

  const refreshInPlace = useCallback(async () => {
    bumpOverviewRefresh();
    await refreshStudentData();
  }, [bumpOverviewRefresh, refreshStudentData]);

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab);
      router.replace(studentManageTabPath(studentId, tab));
    },
    [router, studentId],
  );

  const actionsDisabled =
    isArchiving ||
    isRestoring ||
    isPermanentlyDeleting ||
    isActivating ||
    isDeactivating;

  const activeSection = useMemo(() => TAB_LABELS[activeTab], [activeTab]);

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
    <div className="space-y-4">
      <StudentManageHeader
        student={student}
        activeSection={activeSection}
        actionsDisabled={actionsDisabled}
        onEdit={() => setIsEditOpen(true)}
        onActivate={() => setIsActivateOpen(true)}
        onDeactivate={() => setIsDeactivateOpen(true)}
        onArchive={() => setIsArchiveOpen(true)}
        onRestore={() => setIsRestoreOpen(true)}
        onPermanentDelete={() => setIsPermanentDeleteOpen(true)}
      />

      <StudentManageWorkspace
        student={student}
        activeTab={activeTab}
        overviewRefreshKey={overviewRefreshKey}
        onTabChange={handleTabChange}
        onStudentRefresh={handleStudentDataRefresh}
        onEnrollmentMutation={returnToEnrollmentsTab}
      />

      <UpdateStudentModal
        open={isEditOpen}
        student={student}
        onClose={() => setIsEditOpen(false)}
        onSuccess={async () => {
          setIsEditOpen(false);
          await returnToOverview();
        }}
      />

      <ConfirmDialog
        open={isActivateOpen}
        title="Activate student?"
        description={`Activate "${[student.firstName, student.lastName].filter(Boolean).join(" ")}"?`}
        confirmLabel="Activate"
        loading={isActivating}
        onCancel={() => setIsActivateOpen(false)}
        onConfirm={async () => {
          try {
            await activateStudent(student.id);
            appToast.success("Student activated successfully");
            setIsActivateOpen(false);
            await refreshInPlace();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={isDeactivateOpen}
        title="Deactivate student?"
        description={`Deactivate "${[student.firstName, student.lastName].filter(Boolean).join(" ")}"?`}
        confirmLabel="Deactivate"
        loading={isDeactivating}
        onCancel={() => setIsDeactivateOpen(false)}
        onConfirm={async () => {
          try {
            await deactivateStudent(student.id);
            appToast.success("Student deactivated successfully");
            setIsDeactivateOpen(false);
            await refreshInPlace();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
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
        open={isRestoreOpen}
        title="Restore student?"
        description={`Restore "${[student.firstName, student.lastName].filter(Boolean).join(" ")}"?`}
        confirmLabel="Restore"
        loading={isRestoring}
        onCancel={() => setIsRestoreOpen(false)}
        onConfirm={async () => {
          try {
            await restoreStudent(student.id);
            appToast.success("Student restored successfully");
            setIsRestoreOpen(false);
            await returnToOverview();
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
    </div>
  );
}
