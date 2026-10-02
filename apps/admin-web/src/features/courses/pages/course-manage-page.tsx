"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
import {
  COURSE_MANAGE_DEFAULT_TAB,
  courseManageTabPath,
  isCourseManageTab,
} from "@/src/features/courses/utils/course-manage.routes";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { courseService } from "@/src/features/courses/services/course.service";
import {
  buildCourseDeleteDescription,
  isCourseDeleteAllowed,
  parseCourseDependencySummary,
  type CourseDependencySummary,
} from "@/src/features/courses/utils/course-dependency-copy.utils";

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
  const searchParams = useSearchParams();

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

  const archiveCheckRequestIdRef = useRef(0);
  const [pendingArchiveCheck, setPendingArchiveCheck] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [archiveDependencySummary, setArchiveDependencySummary] =
    useState<CourseDependencySummary | null>(null);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] =
    useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tabParam = searchParams.get("tab");
    return tabParam && isCourseManageTab(tabParam)
      ? tabParam
      : COURSE_MANAGE_DEFAULT_TAB;
  });

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const nextTab =
      tabParam && isCourseManageTab(tabParam)
        ? tabParam
        : COURSE_MANAGE_DEFAULT_TAB;
    setActiveTab(nextTab);
  }, [searchParams]);

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab);
      router.replace(courseManageTabPath(courseId, tab), { scroll: false });
    },
    [courseId, router],
  );

  const categoryName = useMemo(
    () => getCourseCategoryDisplayName(course),
    [course],
  );

  const refreshCourseData = useCallback(async () => {
    await Promise.all([refetch(), refetchSummary()]);
  }, [refetch, refetchSummary]);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "hidden") {
        return;
      }
      void refreshCourseData();
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [refreshCourseData]);

  const returnToOverview = useCallback(async () => {
    setActiveTab(COURSE_MANAGE_DEFAULT_TAB);
    await refreshCourseData();
  }, [refreshCourseData]);

  const closeArchiveDialog = useCallback(() => {
    archiveCheckRequestIdRef.current += 1;
    setPendingArchiveCheck(false);
    setIsArchiveOpen(false);
    setArchiveDependencySummary(null);
  }, []);

  const startArchiveDependencyCheck = useCallback(async () => {
    if (!course) {
      return;
    }

    const requestId = ++archiveCheckRequestIdRef.current;
    setPendingArchiveCheck(true);

    try {
      const response = await courseService.getCourseDependencies(course.id);
      const summary = parseCourseDependencySummary(response.data);

      if (requestId !== archiveCheckRequestIdRef.current) {
        return;
      }

      setArchiveDependencySummary(summary);
      setIsArchiveOpen(true);
    } catch (err) {
      if (requestId !== archiveCheckRequestIdRef.current) {
        return;
      }

      appToast.error(getErrorMessage(err));
    } finally {
      if (requestId === archiveCheckRequestIdRef.current) {
        setPendingArchiveCheck(false);
      }
    }
  }, [course]);

  const actionsDisabled =
    isArchiving ||
    isRestoring ||
    isPermanentlyDeleting ||
    pendingArchiveCheck;

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
        archiveChecking={pendingArchiveCheck}
        onArchive={() => {
          void startArchiveDependencyCheck();
        }}
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
        onTabChange={handleTabChange}
      />

      {isArchiveOpen && archiveDependencySummary ? (
        <CourseDeleteDialog
          open
          isLoading={isArchiving}
          canDelete={isCourseDeleteAllowed(archiveDependencySummary)}
          description={buildCourseDeleteDescription(archiveDependencySummary)}
          onClose={closeArchiveDialog}
          onConfirm={async () => {
            if (!isCourseDeleteAllowed(archiveDependencySummary)) {
              return;
            }

            try {
              await deleteCourse(course.id);
              appToast.success("Course archived successfully");
              closeArchiveDialog();
              await returnToOverview();
            } catch (err) {
              appToast.error(getErrorMessage(err));
              try {
                const response = await courseService.getCourseDependencies(
                  course.id,
                );
                setArchiveDependencySummary(
                  parseCourseDependencySummary(response.data),
                );
              } catch {
                // Keep existing dialog copy if refresh fails.
              }
            }
          }}
        />
      ) : null}

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
