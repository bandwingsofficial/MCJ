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
  CourseResourceDeleteDialog,
  CourseResourceEmpty,
  CourseResourceFilters,
  CourseResourceForm,
  CourseResourceList,
  CourseResourceMoveDialog,
  CourseResourceSkeleton,
} from "@/src/features/course-resources/components";

import {
  useCourseResources,
  useCreateCourseResource,
  useMoveCourseResource,
  usePermanentDeleteCourseResource,
  useRestoreCourseResource,
  useUpdateCourseResource,
} from "@/src/features/course-resources/hooks";

import type {
  CourseResource,
  CourseResourceFormValues,
} from "@/src/features/course-resources/types";

interface CourseResourcesPageProps {
  lessonId: string;
}

export function CourseResourcesPage({
  lessonId,
}: CourseResourcesPageProps) {
  const {
    resources,
    filters,
    setFilters,
    isLoading,
    error,
    refetch,
  } =
    useCourseResources({
      lessonId,
      includeDeleted: false,
    });

  const {
    createCourseResource,
    isLoading: isCreating,
  } =
    useCreateCourseResource();

  const {
    updateCourseResource,
    isLoading: isUpdating,
  } =
    useUpdateCourseResource();

  const {
    permanentDeleteCourseResource,
    isLoading: isDeleting,
  } =
    usePermanentDeleteCourseResource();

  const {
    restoreCourseResource,
  } =
    useRestoreCourseResource();

  const {
    moveCourseResource,
    isLoading: isMoving,
  } =
    useMoveCourseResource();

  const [
    selectedResource,
    setSelectedResource,
  ] =
    useState<CourseResource | null>(
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

  const filteredResources =
    useMemo(() => {
      return resources.filter(
        (resource) => {
          if (
            !filters.includeDeleted &&
            resource.isDeleted
          ) {
            return false;
          }

          if (
            filters.search.trim()
          ) {
            return resource.title
              .toLowerCase()
              .includes(
                filters.search.toLowerCase(),
              );
          }

          return true;
        },
      );
    }, [
      resources,
      filters,
    ]);

  const closeForm = () => {
    setSelectedResource(
      null,
    );

    setFormOpen(false);
  };

  const closeDeleteDialog =
    () => {
      setSelectedResource(
        null,
      );

      setDeleteOpen(false);
    };

  const closeMoveDialog =
    () => {
      setSelectedResource(
        null,
      );

      setMoveOpen(false);
    };

  if (isLoading) {
    return (
      <CourseResourceSkeleton />
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed To Load Resources"
        description={error}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <PageHeader
        title="Course Resources"
        description="Manage lesson resources."
        actions={
          <Button
            onClick={() =>
              setFormOpen(true)
            }
          >
            Add Resource
          </Button>
        }
      />

      <div className="mt-6">
        <CourseResourceFilters
          filters={filters}
          onChange={setFilters}
        />
      </div>

      <div className="mt-6">
        {filteredResources.length ===
        0 ? (
          <CourseResourceEmpty />
        ) : (
          <CourseResourceList
            resources={
              filteredResources
            }
            onEdit={(
              resource,
            ) => {
              setSelectedResource(
                resource,
              );

              setFormOpen(
                true,
              );
            }}
            onMove={(
              resource,
            ) => {
              setSelectedResource(
                resource,
              );

              setMoveOpen(
                true,
              );
            }}
            onDelete={(
              resource,
            ) => {
              setSelectedResource(
                resource,
              );

              setDeleteOpen(
                true,
              );
            }}
            onRestore={async (
              resource,
            ) => {
              await appToast.promise(
                restoreCourseResource(
                  resource.id,
                ),
                {
                  loading:
                    "Restoring resource...",
                  success:
                    "Resource restored successfully.",
                  error:
                    "Failed to restore resource.",
                },
              );

              await refetch();
            }}
          />
        )}
      </div>

      <CourseResourceForm
        open={formOpen}
        loading={
          isCreating ||
          isUpdating
        }
        lessonId={lessonId}
        resource={
          selectedResource ??
          undefined
        }
        onClose={closeForm}
        onSubmit={async (
          values: CourseResourceFormValues,
          file?: File | null,
        ) => {
          if (
            selectedResource
          ) {
            await appToast.promise(
  updateCourseResource(
    selectedResource.id,
    {
      title: values.title,
      type: values.type,
      fileUrl: values.fileUrl,
    },
    file,
  ),
              {
                loading:
                  "Updating resource...",
                success:
                  "Resource updated successfully.",
                error:
                  "Failed to update resource.",
              },
            );
          } else {
           await appToast.promise(
  createCourseResource(
    values,
    file,
  ),
              {
                loading:
                  "Creating resource...",
                success:
                  "Resource created successfully.",
                error:
                  "Failed to create resource.",
              },
            );
          }

          closeForm();

          await refetch();
        }}
      />

      <CourseResourceDeleteDialog
        open={deleteOpen}
        loading={
          isDeleting
        }
        onClose={
          closeDeleteDialog
        }
        onConfirm={async () => {
          if (
            !selectedResource
          ) {
            return;
          }

          await appToast.promise(
            permanentDeleteCourseResource(
              selectedResource.id,
            ),
            {
              loading:
                "Deleting resource...",
              success:
                "Resource permanently deleted.",
              error:
                "Failed to delete resource.",
            },
          );

          closeDeleteDialog();

          await refetch();
        }}
      />

      <CourseResourceMoveDialog
        open={moveOpen}
        loading={isMoving}
        currentPosition={
          selectedResource
            ?.displayOrder ?? 1
        }
        onClose={
          closeMoveDialog
        }
        onMove={async (
          newPosition,
        ) => {
          if (
            !selectedResource
          ) {
            return;
          }

          await appToast.promise(
            moveCourseResource(
  selectedResource.id,
  {
    newPosition,
  },
),
            {
              loading:
                "Moving resource...",
              success:
                "Resource moved successfully.",
              error:
                "Failed to move resource.",
            },
          );

          closeMoveDialog();

          await refetch();
        }}
      />
    </>
  );
}