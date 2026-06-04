"use client";

import { useMemo, useState } from "react";

import { useCategories } from "@/src/features/categories/hooks/use-categories";
import { useBranches } from "@/src/features/branches/hooks/use-branches";

import { Button } from "@/src/shared/components/ui/button";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Card } from "@/src/shared/components/ui/card";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCourses } from "@/src/features/courses/hooks/use-courses";

import { useActivateCourse } from "@/src/features/courses/hooks/use-activate-course";
import { useDeactivateCourse } from "@/src/features/courses/hooks/use-deactivate-course";
import { useDeleteCourse } from "@/src/features/courses/hooks/use-delete-course";
import { useRestoreCourse } from "@/src/features/courses/hooks/use-restore-course";
import { usePermanentlyDeleteCourse } from "@/src/features/courses/hooks/use-permanently-delete-course";

import { CourseFilters } from "@/src/features/courses/components/course-filters";
import { CourseTable } from "@/src/features/courses/components/course-table";
import { CourseFormModal } from "@/src/features/courses/components/course-form-modal";

import {
  CourseListItem,
} from "@/src/features/courses/types/course.types";

export function CoursesPage() {
  const [drawerOpen, setDrawerOpen] =
    useState(false);

  const [selectedCourse, setSelectedCourse] =
    useState<CourseListItem | null>(
      null
    );

  const {
    courses,
    count,
    filters,
    setFilters,
    isLoading,
    error,
    refetch,
  } = useCourses();

  const {
  categories,
} = useCategories();

const {
  branches,
} = useBranches();


  const {
    activateCourse,
  } = useActivateCourse();

  const {
    deactivateCourse,
  } = useDeactivateCourse();

  const {
    deleteCourse,
  } = useDeleteCourse();

  const {
    restoreCourse,
  } = useRestoreCourse();

  const {
    permanentlyDeleteCourse,
  } =
    usePermanentlyDeleteCourse();

     const categoryOptions =
  useMemo(
    () =>
      categories.map(
        (category) => ({
          label:
            category.name,
          value:
            category.id,
        })
      ),
    [categories]
  );

const branchOptions =
  useMemo(
    () =>
      branches.map(
        (branch) => ({
          label:
            branch.branchName,
          value:
            branch.id,
        })
      ),
    [branches]
  );

  const filteredCourses =
    useMemo(() => {
      let items = [...courses];

      if (
        filters.search.trim()
      ) {
        const search =
          filters.search.toLowerCase();

        items = items.filter(
          (course) =>
            course.title
              .toLowerCase()
              .includes(search)
        );
      }

      if (filters.status) {
        items = items.filter(
          (course) =>
            course.status ===
            filters.status
        );
      }

      return items;
    }, [
      courses,
      filters.search,
      filters.status,
    ]);

  if (isLoading) {
    return (
      <SkeletonTable rows={10} />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed To Load Courses"
        description={error}
        onRetry={refetch}
      />
    );
  }

 
  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Courses"
          description={`Manage all courses (${filteredCourses.length})`}
          actions={
            <Button
              onClick={() => {
                setSelectedCourse(
                  null
                );

                setDrawerOpen(
                  true
                );
              }}
            >
              Create Course
            </Button>
          }
        />

        <Card>
          <div className="p-5">
            <CourseFilters
              filters={filters}
              onChange={
                setFilters
              }
            />
          </div>
        </Card>

        {filteredCourses.length ===
        0 ? (
          <EmptyState
            title="No Courses Found"
            description="Create your first course."
          />
        ) : (
          <CourseTable
            courses={
              filteredCourses
            }
            onView={() => {}}
            onEdit={(
              course
            ) => {
              setSelectedCourse(
                course
              );

              setDrawerOpen(
                true
              );
            }}
            onActivate={async (
              course
            ) => {
              try {
                await activateCourse(
                  course.id
                );

                appToast.success(
                  "Course activated successfully"
                );

                await refetch();
              } catch (
                error
              ) {
                appToast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to activate course"
                );
              }
            }}
            onDeactivate={async (
              course
            ) => {
              try {
                await deactivateCourse(
                  course.id
                );

                appToast.success(
                  "Course deactivated successfully"
                );

                await refetch();
              } catch (
                error
              ) {
                appToast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to deactivate course"
                );
              }
            }}
            onDelete={async (
              course
            ) => {
              try {
                await deleteCourse(
                  course.id
                );

                appToast.success(
                  "Course deleted successfully"
                );

                await refetch();
              } catch (
                error
              ) {
                appToast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to delete course"
                );
              }
            }}
            onRestore={async (
              course
            ) => {
              try {
                await restoreCourse(
                  course.id
                );

                appToast.success(
                  "Course restored successfully"
                );

                await refetch();
              } catch (
                error
              ) {
                appToast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to restore course"
                );
              }
            }}
            onPermanentDelete={async (
              course
            ) => {
              try {
                await permanentlyDeleteCourse(
                  course.id
                );

                appToast.success(
                  "Course permanently deleted successfully"
                );

                await refetch();
              } catch (
                error
              ) {
                appToast.error(
                  error instanceof Error
                    ? error.message
                    : "Failed to permanently delete course"
                );
              }
            }}
          />
        )}
      </div>

      <CourseFormModal
        open={drawerOpen}
        course={
          selectedCourse as never
        }
        categoryOptions={
  categoryOptions
}
branchOptions={
  branchOptions
}
        onClose={() => {
          setDrawerOpen(
            false
          );

          setSelectedCourse(
            null
          );
        }}
        onSuccess={refetch}
      />
    </>
  );
}