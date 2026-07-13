"use client";

import { useMemo, useState } from "react";
import { JobViewDrawer } from "@/src/features/jobs/components/JobViewDrawer";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Button } from "@/src/shared/components/ui/button";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { JobDialog } from "@/src/features/jobs/components/JobDialog";
import { JobFilters } from "@/src/features/jobs/components/JobFilters";
import { JobTable } from "@/src/features/jobs/components/JobTable";

import { useJobs } from "@/src/features/jobs/hooks/useJobs";

import { jobService } from "@/src/features/jobs/services/job.service";

import type {
  CreateJobRequest,
  Job,
} from "@/src/features/jobs/types/job.types";

import type {
  EmploymentType,
  JobStatus,
} from "@/src/features/jobs/types/job.types";

type DialogMode =
  | "create"
  | "edit";

export function JobsPage() {
  const {
    jobs,
    isLoading,
    error,
    refetch,
  } = useJobs();

  const [
    dialogOpen,
    setDialogOpen,
  ] = useState(false);

  const [
  viewDrawerOpen,
  setViewDrawerOpen,
] = useState(false);

  const [
    dialogMode,
    setDialogMode,
  ] =
    useState<DialogMode>(
      "create",
    );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    selectedJob,
    setSelectedJob,
  ] =
    useState<Job>();

  const [
    deleteDialog,
    setDeleteDialog,
  ] = useState(false);

  const [
    restoreDialog,
    setRestoreDialog,
  ] = useState(false);

  const [
  filters,
  setFilters,
] = useState<{
  search: string;
  includeDeleted: boolean;
  status: JobStatus | "";
  employmentType: EmploymentType | "";
}>({
  search: "",
  includeDeleted: false,
  status: "",
  employmentType: "",
});

  const filteredJobs =
    useMemo(() => {
      return jobs.filter(
        (job) => {
          const search =
            filters.search
              .trim()
              .toLowerCase();

          const matchesSearch =
            !search ||
            job.title
              .toLowerCase()
              .includes(
                search,
              ) ||
            job.companyName
              .toLowerCase()
              .includes(
                search,
              );

          const matchesStatus =
            !filters.status ||
            job.status ===
              filters.status;

          const matchesEmployment =
            !filters.employmentType ||
            job.employmentType ===
              filters.employmentType;

          const matchesDeleted =
            filters.includeDeleted ||
            !job.isDeleted;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesEmployment &&
            matchesDeleted
          );
        },
      );
    }, [
      jobs,
      filters,
    ]);

  const handleCreate =
    () => {
      setSelectedJob(
        undefined,
      );

      setDialogMode(
        "create",
      );

      setDialogOpen(true);
    };

  const handleEdit = (
    job: Job,
  ) => {
    setSelectedJob(job);

    setDialogMode(
      "edit",
    );

    setDialogOpen(true);
  };

  const handleDialogClose =
    () => {
      setDialogOpen(false);

      setSelectedJob(
        undefined,
      );
    };

  const handleSubmit = async (
  values: CreateJobRequest,
  image: File | null,
) => {
      try {
        setIsSubmitting(
          true,
        );

        if (
          dialogMode ===
            "create"
        ) {
         await jobService.createJob(
  values,
  image,
);
          appToast.success(
            "Job created successfully.",
          );
        } else if (
          selectedJob
        ) {
          await jobService.updateJob(
            selectedJob.id,
            values,
          );

          appToast.success(
            "Job updated successfully.",
          );
        }

        handleDialogClose();

        await refetch();
      } catch (error) {
        const message =
          error instanceof
          Error
            ? error.message
            : "Operation failed.";

        appToast.error(
          message,
        );
      } finally {
        setIsSubmitting(
          false,
        );
      }
    };

  const handleView = (
  job: Job,
) => {
  setSelectedJob(job);
  setViewDrawerOpen(true);
};

  const handleDelete = (
    job: Job,
  ) => {
    setSelectedJob(job);

    setDeleteDialog(true);
  };

  const handleRestore = (
    job: Job,
  ) => {
    setSelectedJob(job);

    setRestoreDialog(true);
  };

  const handleActivate =
    async (
      job: Job,
    ) => {
      try {
        await jobService.activateJob(
          job.id,
        );

        appToast.success(
          "Job activated successfully.",
        );

        await refetch();
      } catch (error) {
        appToast.error(
          error instanceof
            Error
            ? error.message
            : "Activation failed.",
        );
      }
    };

  const handleDeactivate =
    async (
      job: Job,
    ) => {
      try {
        await jobService.deactivateJob(
          job.id,
        );

        appToast.success(
          "Job deactivated successfully.",
        );

        await refetch();
      } catch (error) {
        appToast.error(
          error instanceof
            Error
            ? error.message
            : "Deactivation failed.",
        );
      }
    };
      const confirmDelete =
    async () => {
      if (!selectedJob) {
        return;
      }

      try {
        await jobService.deleteJob(
          selectedJob.id,
        );

        appToast.success(
          "Job deleted successfully.",
        );

        setDeleteDialog(
          false,
        );

        setSelectedJob(
          undefined,
        );

        await refetch();
      } catch (error) {
        appToast.error(
          error instanceof
            Error
            ? error.message
            : "Delete failed.",
        );
      }
    };

  const confirmRestore =
    async () => {
      if (!selectedJob) {
        return;
      }

      try {
        await jobService.restoreJob(
          selectedJob.id,
        );

        appToast.success(
          "Job restored successfully.",
        );

        setRestoreDialog(
          false,
        );

        setSelectedJob(
          undefined,
        );

        await refetch();
      } catch (error) {
        appToast.error(
          error instanceof
            Error
            ? error.message
            : "Restore failed.",
        );
      }
    };

  return (
    <>
      <PageHeader
        title="Jobs"
        description="Manage all job postings."
        actions={
          <Button
            onClick={
              handleCreate
            }
          >
            Create Job
          </Button>
        }
      />

      <div className="mt-6 space-y-6">
        <JobFilters
          value={filters}
          onChange={
            setFilters
          }
        />

        <JobTable
          jobs={filteredJobs}
          isLoading={
            isLoading
          }
          error={error}
          onRetry={refetch}
          onView={
            handleView
          }
          onEdit={
            handleEdit
          }
          onActivate={
            handleActivate
          }
          onDeactivate={
            handleDeactivate
          }
          onDelete={
            handleDelete
          }
          onRestore={
            handleRestore
          }
        />
      </div>

      <JobDialog
        open={
          dialogOpen
        }
        mode={
          dialogMode
        }
        job={
          selectedJob
        }
        isSubmitting={
          isSubmitting
        }
        onClose={
          handleDialogClose
        }
        onSubmit={
          handleSubmit
        }
      />

      <JobViewDrawer
  open={viewDrawerOpen}
  job={selectedJob}
  onClose={() => {
    setViewDrawerOpen(false);
    setSelectedJob(undefined);
  }}
/>

      <ConfirmDialog
        open={
          deleteDialog
        }
        title="Delete Job"
        description="This action will soft delete the selected job."
        onConfirm={
          confirmDelete
        }
        onCancel={() =>
          setDeleteDialog(
            false,
          )
        }
      />

      <ConfirmDialog
        open={
          restoreDialog
        }
        title="Restore Job"
        description="Do you want to restore this job?"
        onConfirm={
          confirmRestore
        }
        onCancel={() =>
          setRestoreDialog(
            false,
          )
        }
      />
    </>
  );
}