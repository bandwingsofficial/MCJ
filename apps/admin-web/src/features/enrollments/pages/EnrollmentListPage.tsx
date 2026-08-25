"use client";

import {
  useMemo,
  useState,
} from "react";
import Link from "next/link";

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
  RejectEnrollmentDialog,
  RestoreEnrollmentDialog,
  UpdateEnrollmentStatusDialog,
} from "../components/dialogs";

import { EnrollmentDetailsDrawer } from "../components/drawers";

import {
  useApproveEnrollment,
  useDeleteEnrollment,
  usePermanentDeleteEnrollment,
  useRejectEnrollment,
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

  const { approveEnrollment, isLoading: approving } =
    useApproveEnrollment();

  const { rejectEnrollment, isLoading: rejecting } =
    useRejectEnrollment();

  const [
    selectedEnrollment,
    setSelectedEnrollment,
  ] =
    useState<Enrollment | null>(
      null,
    );

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

  const [rejectOpen, setRejectOpen] = useState(false);

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

  const handleApprove = async (enrollment: Enrollment) => {
    await approveEnrollment(enrollment.id);
    setDrawerOpen(false);
    await refetch();
  };

  const handleRejectClick = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment);
    setRejectOpen(true);
  };

  const confirmReject = async (reason: string) => {
    if (!selectedEnrollment) {
      return;
    }

    await rejectEnrollment(selectedEnrollment.id, reason);
    setRejectOpen(false);
    setDrawerOpen(false);
    await refetch();
  };

  const filterPendingApproval = () => {
    setFilters({
      ...filters,
      status: "PENDING_APPROVAL" as Enrollment["status"],
      skip: 0,
    });
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
        description="Review paid enrollment requests and manage admissions."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={filterPendingApproval}>
              Pending Approval
            </Button>
            <Link
              href="/enrollments/create"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-[#2447A8] px-4 text-sm font-medium text-white hover:bg-[#1e3a8a]"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Enrollment
            </Link>
          </div>
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
        onApprove={handleApprove}
        onReject={handleRejectClick}
        isProcessing={approving || rejecting}
      />

      <RejectEnrollmentDialog
        open={rejectOpen}
        loading={rejecting}
        onConfirm={confirmReject}
        onClose={() => setRejectOpen(false)}
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