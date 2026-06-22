"use client";

import {
  useMemo,
  useState,
} from "react";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  CourseLessonDeleteDialog,
  CourseLessonEmpty,
  CourseLessonFilters,
  CourseLessonForm,
  CourseLessonList,
  CourseLessonMoveDialog,
  CourseLessonSkeleton,
} from "@/src/features/course-lessons/components";

import {
  useCourseLessons,
  useCreateCourseLesson,
  useUpdateCourseLesson,
  useDeleteCourseLesson,
  useMoveCourseLesson,
  useRestoreCourseLesson,
} from "@/src/features/course-lessons/hooks";

import type {
  CourseLesson,
  CourseLessonFilters as CourseLessonFilterValues,
  CourseLessonFormValues,
} from "@/src/features/course-lessons/types";

interface CourseLessonsPageProps {
  courseId: string;
}

export function CourseLessonsPage({
  courseId,
}: CourseLessonsPageProps) {
  const {
    courseLessons,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = useCourseLessons();

  const {
    createCourseLesson,
    isLoading: isCreating,
  } =
    useCreateCourseLesson();

  const {
    updateCourseLesson,
    isLoading: isUpdating,
  } =
    useUpdateCourseLesson();

  const {
    deleteCourseLesson,
    isLoading: isDeleting,
  } =
    useDeleteCourseLesson();

  const {
    restoreCourseLesson,
  } =
    useRestoreCourseLesson();

  const {
    moveCourseLesson,
    isLoading: isMoving,
  } =
    useMoveCourseLesson();

  const [
    selectedLesson,
    setSelectedLesson,
  ] =
    useState<CourseLesson | null>(
      null,
    );

  const [
    formOpen,
    setFormOpen,
  ] = useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] = useState(false);

  const [
    moveOpen,
    setMoveOpen,
  ] = useState(false);
    const filteredLessons =
    useMemo(() => {
      return courseLessons.filter(
        (lesson) => {
          if (
            !filters.includeDeleted &&
            lesson.isDeleted
          ) {
            return false;
          }

          if (
            filters.search.trim()
          ) {
            return lesson.title
              .toLowerCase()
              .includes(
                filters.search.toLowerCase(),
              );
          }

          return true;
        },
      );
    }, [
      courseLessons,
      filters,
    ]);

  const closeForm = () => {
    setSelectedLesson(
      null,
    );

    setFormOpen(false);
  };

  const closeDeleteDialog =
    () => {
      setSelectedLesson(
        null,
      );

      setDeleteOpen(false);
    };

  const closeMoveDialog =
    () => {
      setSelectedLesson(
        null,
      );

      setMoveOpen(false);
    };

  if (isLoading) {
    return (
      <CourseLessonSkeleton />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed To Load Lessons"
        description={error}
        onRetry={refetch}
      />
    );
  }
    return (
    <>
      <PageHeader
        title="Course Lessons"
        description="Manage lessons for this course."
        actions={
          <Button
            onClick={() =>
              setFormOpen(true)
            }
          >
            Add Lesson
          </Button>
        }
      />

      <div className="mt-6">
        <CourseLessonFilters
          filters={filters}
          onChange={(
            nextFilters,
          ) =>
            setFilters(
              nextFilters,
            )
          }
        />
      </div>

      <div className="mt-6">
        {filteredLessons.length ===
        0 ? (
          <CourseLessonEmpty />
        ) : (
          <CourseLessonList
            lessons={
              filteredLessons
            }
            onEdit={(
              lesson,
            ) => {
              setSelectedLesson(
                lesson,
              );

              setFormOpen(
                true,
              );
            }}
            onMove={(
              lesson,
            ) => {
              setSelectedLesson(
                lesson,
              );

              setMoveOpen(
                true,
              );
            }}
            onDelete={(
              lesson,
            ) => {
              setSelectedLesson(
                lesson,
              );

              setDeleteOpen(
                true,
              );
            }}
            onRestore={async (
              lesson,
            ) => {
              await appToast.promise(
                restoreCourseLesson(
                  lesson.id,
                ),
                {
                  loading:
                    "Restoring lesson...",
                  success:
                    "Lesson restored successfully.",
                  error:
                    "Failed to restore lesson.",
                },
              );

              await refetch();
            }}
          />
        )}
      </div>
            <CourseLessonForm
        open={formOpen}
        loading={
          isCreating ||
          isUpdating
        }
        courseId={courseId}
        lesson={
          selectedLesson ??
          undefined
        }
        onClose={closeForm}
        onSubmit={async (
          values: CourseLessonFormValues,
        ) => {
          if (
            selectedLesson
          ) {
            await appToast.promise(
              updateCourseLesson(
                selectedLesson.id,
                {
                  title:
                    values.title,
                  description:
                    values.description,
                  videoUrl:
                    values.videoUrl,
                },
              ),
              {
                loading:
                  "Updating lesson...",
                success:
                  "Lesson updated successfully.",
                error:
                  "Failed to update lesson.",
              },
            );
          } else {
            await appToast.promise(
              createCourseLesson(
                values,
              ),
              {
                loading:
                  "Creating lesson...",
                success:
                  "Lesson created successfully.",
                error:
                  "Failed to create lesson.",
              },
            );
          }

          closeForm();

          await refetch();
        }}
      />

      <CourseLessonDeleteDialog
        open={deleteOpen}
        loading={
          isDeleting
        }
        onClose={
          closeDeleteDialog
        }
        onConfirm={async () => {
          if (
            !selectedLesson
          ) {
            return;
          }

          await appToast.promise(
            deleteCourseLesson(
              selectedLesson.id,
            ),
            {
              loading:
                "Deleting lesson...",
              success:
                "Lesson deleted successfully.",
              error:
                "Failed to delete lesson.",
            },
          );

          closeDeleteDialog();

          await refetch();
        }}
      />

      <CourseLessonMoveDialog
        open={moveOpen}
        loading={isMoving}
        currentPosition={
          selectedLesson
            ?.displayOrder ??
          1
        }
        onClose={
          closeMoveDialog
        }
        onMove={async (
          newPosition,
        ) => {
          if (
            !selectedLesson
          ) {
            return;
          }

          await appToast.promise(
            moveCourseLesson(
              selectedLesson.id,
              newPosition,
            ),
            {
              loading:
                "Moving lesson...",
              success:
                "Lesson moved successfully.",
              error:
                "Failed to move lesson.",
            },
          );

          closeMoveDialog();

          await refetch();
        }}
      />
    </>
  );
}