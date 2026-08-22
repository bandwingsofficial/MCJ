"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useCategories } from "@/src/features/categories/hooks/use-categories";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCourse } from "@/src/features/courses/hooks/use-course";
import { useCourseSummary } from "@/src/features/courses/hooks/use-course-summary";
import { useDeleteCourse } from "@/src/features/courses/hooks/use-delete-course";
import { useActivateCourse } from "@/src/features/courses/hooks/use-activate-course";
import { useDeactivateCourse } from "@/src/features/courses/hooks/use-deactivate-course";
import { useRestoreCourse } from "@/src/features/courses/hooks/use-restore-course";
import { usePermanentlyDeleteCourse } from "@/src/features/courses/hooks/use-permanently-delete-course";

import { CourseFormModal } from "@/src/features/courses/components/course-form-modal";
import { CourseActivateDialog } from "@/src/features/courses/components/course-activate-dialog";
import { CourseDeactivateDialog } from "@/src/features/courses/components/course-deactivate-dialog";
import { CourseDeleteDialog } from "@/src/features/courses/components/course-delete-dialog";
import { CourseRestoreDialog } from "@/src/features/courses/components/course-restore-dialog";
import { CourseManageHeader } from "@/src/features/courses/components/manage/course-manage-header";
import {
  CourseManageWorkspace,
  type TabKey,
} from "@/src/features/courses/components/manage/course-manage-workspace";
import { getCourseCategoryDisplayName } from "@/src/features/courses/utils/course-category.utils";
import {
  COURSE_MANAGE_DEFAULT_TAB,
} from "@/src/features/courses/utils/course-manage.routes";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  courseId: string;
}

const TAB_LABELS: Record<TabKey, string> = {
  overview: "Overview",
  modules: "Modules",
  preview: "Preview",
};

export function CourseManagePage({ courseId }: Props) {
  const router = useRouter();
  const { categories } = useCategories();

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
  const { activateCourse, isLoading: isActivating } =
    useActivateCourse();
  const { deactivateCourse, isLoading: isDeactivating } =
    useDeactivateCourse();
  const { restoreCourse, isLoading: isRestoring } = useRestoreCourse();
  const {
    permanentlyDeleteCourse,
    isLoading: isPermanentlyDeleting,
  } = usePermanentlyDeleteCourse();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isActivateOpen, setIsActivateOpen] = useState(false);
  const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] =
    useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>(
    COURSE_MANAGE_DEFAULT_TAB,
  );
  const [overviewRefreshKey, setOverviewRefreshKey] = useState(0);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categories],
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
    setOverviewRefreshKey((current) => current + 1);
    await refreshCourseData();
  }, [refreshCourseData]);

  const actionsDisabled =
    isArchiving ||
    isActivating ||
    isDeactivating ||
    isRestoring ||
    isPermanentlyDeleting;

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
    <div className="space-y-4">
      <CourseManageHeader
        course={course}
        categoryName={categoryName}
        activeSection={TAB_LABELS[activeTab]}
        actionsDisabled={actionsDisabled}
        onEdit={() => setIsEditOpen(true)}
        onActivate={() => setIsActivateOpen(true)}
        onDeactivate={() => setIsDeactivateOpen(true)}
        onArchive={() => setIsArchiveOpen(true)}
        onRestore={() => setIsRestoreOpen(true)}
        onPermanentDelete={() => setIsPermanentDeleteOpen(true)}
      />

      <CourseManageWorkspace
        course={course}
        summary={summary}
        summaryLoading={summaryLoading}
        activeTab={activeTab}
        overviewRefreshKey={overviewRefreshKey}
        onSummaryRefresh={refreshCourseData}
        onCourseUpdated={setCourseData}
        onEditCourse={() => setIsEditOpen(true)}
        onMutationSuccess={returnToOverview}
        onTabChange={setActiveTab}
      />

      <CourseFormModal
        open={isEditOpen}
        course={course}
        categoryOptions={categoryOptions}
        onClose={() => setIsEditOpen(false)}
        onSuccess={async () => {
          setIsEditOpen(false);
          await returnToOverview();
        }}
      />

      <CourseActivateDialog
        open={isActivateOpen}
        isLoading={isActivating}
        onClose={() => setIsActivateOpen(false)}
        onConfirm={async () => {
          try {
            await activateCourse(course.id);
            appToast.success("Course activated successfully");
            setIsActivateOpen(false);
            await returnToOverview();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <CourseDeactivateDialog
        open={isDeactivateOpen}
        isLoading={isDeactivating}
        onClose={() => setIsDeactivateOpen(false)}
        onConfirm={async () => {
          try {
            await deactivateCourse(course.id);
            appToast.success("Course deactivated successfully");
            setIsDeactivateOpen(false);
            await returnToOverview();
          } catch (err) {
            appToast.error(getErrorMessage(err));
          }
        }}
      />

      <CourseDeleteDialog
        open={isArchiveOpen}
        isLoading={isArchiving}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={async () => {
          try {
            await deleteCourse(course.id);
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
        description={`This action cannot be undone. (${course.title})`}
        confirmLabel="Permanently Delete"
        loadingLabel="Permanently Deleting..."
        loading={isPermanentlyDeleting}
        onCancel={() => setIsPermanentDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await permanentlyDeleteCourse(course.id);
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
