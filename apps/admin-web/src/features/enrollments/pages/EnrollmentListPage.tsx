"use client";

import {
  useMemo,
  useState,
} from "react";

import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { Modal } from "@/src/shared/components/ui/model";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { SearchInput } from "@/src/shared/components/ui/search-input";

import { Enrollment } from "../types";

import { useEnrollments } from "../hooks";

import { EnrollmentTable } from "../components/table";

import { EnrollmentForm } from "../components/form";

import {
  DeleteEnrollmentDialog,
  PermanentDeleteEnrollmentDialog,
  RestoreEnrollmentDialog,
  UpdateEnrollmentStatusDialog,
} from "../components/dialogs";

import { EnrollmentDetailsDrawer } from "../components/drawers";

import {
  useDeleteEnrollment,
  usePermanentDeleteEnrollment,
  useRestoreEnrollment,
  useUpdateEnrollmentStatus,
} from "../hooks";
import { EnrollmentFilters } from "../components/filters";

export function EnrollmentListPage() {
  const {
    enrollments,
    count,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
  } = useEnrollments();

  const {
    deleteEnrollment,
    isLoading: deleting,
  } = useDeleteEnrollment();

  const {
    restoreEnrollment,
    isLoading: restoring,
  } = useRestoreEnrollment();

  const {
    permanentDeleteEnrollment,
    isLoading:
      permanentlyDeleting,
  } =
    usePermanentDeleteEnrollment();

  const {
    updateStatus,
    isLoading:
      updatingStatus,
  } =
    useUpdateEnrollmentStatus();

  const [
    selectedEnrollment,
    setSelectedEnrollment,
  ] =
    useState<Enrollment | null>(
      null,
    );

  const [
    createOpen,
    setCreateOpen,
  ] =
    useState(false);

  const [
    editOpen,
    setEditOpen,
  ] =
    useState(false);

  const [
    drawerOpen,
    setDrawerOpen,
  ] =
    useState(false);

  const [
    deleteOpen,
    setDeleteOpen,
  ] =
    useState(false);

  const [
    restoreOpen,
    setRestoreOpen,
  ] =
    useState(false);

  const [
    permanentDeleteOpen,
    setPermanentDeleteOpen,
  ] =
    useState(false);

  const [
    statusOpen,
    setStatusOpen,
  ] =
    useState(false);

  const totalPages =
    useMemo(
      () =>
        Math.ceil(
          count /
            filters.take,
        ),
      [
        count,
        filters.take,
      ],
    );
  const handleSearch = (
    value: string,
  ) => {
    setFilters({
      ...filters,
      search: value,
       skip: 0,
    });
  };

  const handlePageChange = (
  page: number,
) => {
  setFilters({
    ...filters,
    skip:
      (page - 1) *
      filters.take,
  });
};

  const handleCreate = () => {
    setSelectedEnrollment(
      null,
    );

    setCreateOpen(true);
  };

  const handleView = (
    enrollment: Enrollment,
  ) => {
    setSelectedEnrollment(
      enrollment,
    );

    setDrawerOpen(true);
  };

  const handleEdit = (
    enrollment: Enrollment,
  ) => {
    setSelectedEnrollment(
      enrollment,
    );

    setEditOpen(true);
  };

  const handleDelete = (
    enrollment: Enrollment,
  ) => {
    setSelectedEnrollment(
      enrollment,
    );

    setDeleteOpen(true);
  };

  const handleRestore = (
    enrollment: Enrollment,
  ) => {
    setSelectedEnrollment(
      enrollment,
    );

    setRestoreOpen(true);
  };

  const handlePermanentDelete =
    (
      enrollment: Enrollment,
    ) => {
      setSelectedEnrollment(
        enrollment,
      );

      setPermanentDeleteOpen(
        true,
      );
    };

  const handleStatus =
    (
      enrollment: Enrollment,
    ) => {
      setSelectedEnrollment(
        enrollment,
      );

      setStatusOpen(true);
    };

  const confirmDelete =
    async () => {
      if (
        !selectedEnrollment
      ) {
        return;
      }

      await deleteEnrollment(
        selectedEnrollment.id,
      );

      setDeleteOpen(false);

      await refetch();
    };

  const confirmRestore =
    async () => {
      if (
        !selectedEnrollment
      ) {
        return;
      }

      await restoreEnrollment(
        selectedEnrollment.id,
      );

      setRestoreOpen(false);

      await refetch();
    };

  const confirmPermanentDelete =
    async () => {
      if (
        !selectedEnrollment
      ) {
        return;
      }

      await permanentDeleteEnrollment(
        selectedEnrollment.id,
      );

      setPermanentDeleteOpen(
        false,
      );

      await refetch();
    };

  const confirmStatusUpdate =
    async (
      status:
        Enrollment["status"],
    ) => {
      if (
        !selectedEnrollment
      ) {
        return;
      }

      await updateStatus(
        selectedEnrollment.id,
        {
          status,
        },
      );

      setStatusOpen(false);

      await refetch();
    };

  if (isLoading) {
    return <Loader />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed To Load Enrollments"
        description={
          error
        }
        onRetry={
          refetch
        }
      />
    );
  }

  return (
    <>      <PageHeader
        title="Enrollments"
        description="Manage all enrollments"
        actions={
          <Button
            onClick={
              handleCreate
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Enrollment
          </Button>
        }
      />

      <Card className="mt-4 space-y-4 p-4">

        <EnrollmentFilters
  filters={filters}
  onChange={setFilters}
/>

        {enrollments.length ===
        0 ? (
          <EmptyState
            title="No Enrollments Found"
            description="Create your first enrollment."
          />
        ) : (
          <>
            <EnrollmentTable
              enrollments={
                enrollments
              }
              onView={
                handleView
              }
              onEdit={
                handleEdit
              }
              onDelete={
                handleDelete
              }
              onRestore={
                handleRestore
              }
              onPermanentDelete={
                handlePermanentDelete
              }
              onStatusChange={
                handleStatus
              }
            />

            <Pagination
              page={
                filters.take
              }
              totalPages={
                totalPages
              }
              onPageChange={
                handlePageChange
              }
            />
          </>
        )}

      </Card>

      {/* Create */}

      <Modal
        open={
          createOpen
        }
        title="Create Enrollment"
        onClose={() =>
          setCreateOpen(
            false,
          )
        }
      >
        <EnrollmentForm
          mode="create"
          onSuccess={() => {
            setCreateOpen(
              false,
            );

            void refetch();
          }}
        />
      </Modal>

      {/* Edit */}

      <Modal
        open={editOpen}
        title="Edit Enrollment"
        onClose={() =>
          setEditOpen(
            false,
          )
        }
      >
        {selectedEnrollment && (
          <EnrollmentForm
            mode="edit"
            enrollment={
              selectedEnrollment
            }
            onSuccess={() => {
              setEditOpen(
                false,
              );

              void refetch();
            }}
          />
        )}
      </Modal>

      {/* Details */}

      <EnrollmentDetailsDrawer
        open={
          drawerOpen
        }
        enrollment={
          selectedEnrollment
        }
        onClose={() =>
          setDrawerOpen(
            false,
          )
        }
      />

      {/* Delete */}

      <DeleteEnrollmentDialog
        open={
          deleteOpen
        }
        isLoading={
          deleting
        }
        onClose={() =>
          setDeleteOpen(
            false,
          )
        }
        onConfirm={
          confirmDelete
        }
      />

      {/* Restore */}

      <RestoreEnrollmentDialog
        open={
          restoreOpen
        }
        isLoading={
          restoring
        }
        onClose={() =>
          setRestoreOpen(
            false,
          )
        }
        onConfirm={
          confirmRestore
        }
      />

      {/* Permanent Delete */}

      <PermanentDeleteEnrollmentDialog
        open={
          permanentDeleteOpen
        }
        isLoading={
          permanentlyDeleting
        }
        onClose={() =>
          setPermanentDeleteOpen(
            false,
          )
        }
        onConfirm={
          confirmPermanentDelete
        }
      />

      {/* Status */}

      {selectedEnrollment && (
        <UpdateEnrollmentStatusDialog
          open={
            statusOpen
          }
          value={
            selectedEnrollment.status
          }
          loading={
            updatingStatus
          }
          onClose={() =>
            setStatusOpen(
              false,
            )
          }
          onSubmit={
            confirmStatusUpdate
          }
        />
      )}
    </>
  );
}