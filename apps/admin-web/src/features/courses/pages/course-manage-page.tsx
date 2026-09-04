"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCourse } from "@/src/features/courses/hooks/use-course";
import { useCourseSummary } from "@/src/features/courses/hooks/use-course-summary";
import { useDeleteCourse } from "@/src/features/courses/hooks/use-delete-course";
import { useRestoreCourse } from "@/src/features/courses/hooks/use-restore-course";
import { usePermanentlyDeleteCourse } from "@/src/features/courses/hooks/use-permanently-delete-course";

import { CourseDeleteDialog } from "@/src/features/courses/components/course-delete-dialog";
import { CourseRestoreDialog } from "@/src/features/courses/components/course-restore-dialog";
import { CourseManageHeader } from "@/src/features/courses/components/manage/course-manage-header";
import {
  CourseManageWorkspace,
  type TabKey,
} from "@/src/features/courses/components/manage/course-manage-workspace";
import { getCourseCategoryDisplayName } from "@/src/features/courses/utils/course-category.utils";
import { COURSE_MANAGE_DEFAULT_TAB } from "@/src/features/courses/utils/course-manage.routes";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  courseId: string;
}

const TAB_LABELS: Record<TabKey, string> = {
  overview: "Overview",
  modules: "Modules",
  batches: "Batches",
  faq: "FAQ",
};

export function CourseManagePage({ courseId }: Props) {
  const router = useRouter();

  const {
    course,
    isLoading,
    error,
    refetch,
    setCourseData,
  } = useCourse(courseId);

  const {
    summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useCourseSummary(courseId);

  const { deleteCourse, isLoading: isArchiving } = useDeleteCourse();
  const { restoreCourse, isLoading: isRestoring } = useRestoreCourse();
  const {
    permanentlyDeleteCourse,
    isLoading: isPermanentlyDeleting,
  } = usePermanentlyDeleteCourse();

  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] =
    useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>(
    COURSE_MANAGE_DEFAULT_TAB,
  );

  const categoryName = useMemo(
    () => getCourseCategoryDisplayName(course),
    [course],
  );

  const refreshCourseData = useCallback(async () => {
    await Promise.all([refetch(), refetchSummary()]);
  }, [refetch, refetchSummary]);

  const returnToOverview = useCallback(async () => {
    setActiveTab(COURSE_MANAGE_DEFAULT_TAB);
    await refreshCourseData();
  }, [refreshCourseData]);

  const actionsDisabled =
    isArchiving || isRestoring || isPermanentlyDeleting;

  if (isLoading) {
    return <Loader />;
  }

  if (error || !course) {
    return (
      <ErrorState
        title="Course Not Found"
        description={error ?? "Unable to load this course."}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="min-h-full space-y-4">
      <CourseManageHeader
        course={course}
        categoryName={categoryName}
        activeSection={TAB_LABELS[activeTab]}
        actionsDisabled={actionsDisabled}
        onArchive={() => setIsArchiveOpen(true)}
        onRestore={() => setIsRestoreOpen(true)}
        onPermanentDelete={() => setIsPermanentDeleteOpen(true)}
      />

      <CourseManageWorkspace
        courseId={courseId}
        course={course}
        summary={summary}
        summaryLoading={summaryLoading}
        activeTab={activeTab}
        onSummaryRefresh={refreshCourseData}
        onCourseUpdated={setCourseData}
        onMutationSuccess={returnToOverview}
        onTabChange={setActiveTab}
      />

      <CourseDeleteDialog
        open={isArchiveOpen}
        isLoading={isArchiving}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={async () => {
          try {
            await deleteCourse(course.id);
            appToast.success("Course archived successfully");
            setIsArchiveOpen(false);
            await returnToOverview();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <CourseRestoreDialog
        open={isRestoreOpen}
        isLoading={isRestoring}
        onClose={() => setIsRestoreOpen(false)}
        onConfirm={async () => {
          try {
            await restoreCourse(course.id);
            appToast.success("Course restored successfully");
            setIsRestoreOpen(false);
            await returnToOverview();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <ConfirmDialog
        open={isPermanentDeleteOpen}
        title="Permanently delete course?"
        description={`This action cannot be undone. All course data will be permanently removed from the system. (${course.title})`}
        confirmLabel="Permanently Delete"
        confirmVariant="danger"
        loadingLabel="Permanently Deleting..."
        loading={isPermanentlyDeleting}
        onCancel={() => setIsPermanentDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await permanentlyDeleteCourse(course.id);
            appToast.success("Course permanently deleted");
            setIsPermanentDeleteOpen(false);
            router.push("/courses");
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />
    </div>
  );
}
