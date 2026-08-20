"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { appToast } from "@/src/shared/components/ui/toast";

import type { Branch } from "@/src/features/branches/types/branch.types";
import { useBranch } from "@/src/features/branches/hooks/use-branch";
import { useBranchSummary } from "@/src/features/branches/hooks/use-branch-summary";
import { useDeleteBranch } from "@/src/features/branches/hooks/use-delete-branch";
import { usePermanentDeleteBranch } from "@/src/features/branches/hooks/use-permanent-delete-branch";
import { useRestoreBranch } from "@/src/features/branches/hooks/use-restore-branch";
import { UpdateBranchModal } from "@/src/features/branches/components/update-branch-modal";
import { DeleteBranchDialog } from "@/src/features/branches/components/delete-branch-dialog";
import { PermanentDeleteBranchDialog } from "@/src/features/branches/components/permanent-delete-branch-dialog";
import { RestoreBranchDialog } from "@/src/features/branches/components/restore-branch-dialog";
import { BranchManageHeader } from "@/src/features/branches/components/manage/branch-manage-header";
import { BranchManageWorkspace } from "@/src/features/branches/components/manage/branch-manage-workspace";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

interface Props {
  branchId: string;
}

const TAB_LABELS: Record<string, string> = {
  overview: "Overview",
  users: "Users",
  categories: "Categories",
  courses: "Courses",
  batches: "Batches",
  students: "Students",
  enrollments: "Enrollments",
  instructors: "Instructors",
  reports: "Reports",
};

export function BranchManagePage({ branchId }: Props) {
  const router = useRouter();

  const {
    branch,
    isLoading,
    error,
    refetch,
    setBranchData,
  } = useBranch(branchId);

  const {
    summary,
    isLoading: summaryLoading,
    refetch: refetchSummary,
  } = useBranchSummary(branchId);

  const { deleteBranch, isPending: isArchiving } =
    useDeleteBranch();
  const { restoreBranch, isPending: isRestoring } =
    useRestoreBranch();
  const {
    permanentDeleteBranch,
    isPending: isPermanentlyDeleting,
  } = usePermanentDeleteBranch();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false);
  const [isRestoreOpen, setIsRestoreOpen] = useState(false);
  const [isPermanentDeleteOpen, setIsPermanentDeleteOpen] =
    useState(false);
  const [activeSection, setActiveSection] = useState<string | undefined>(
    undefined,
  );

  const actionsDisabled =
    isArchiving || isRestoring || isPermanentlyDeleting;

  if (isLoading) {
    return <Loader />;
  }

  if (error || !branch) {
    return (
      <ErrorState
        title="Branch Not Found"
        description={
          error ?? "Unable to load this branch."
        }
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const listItem = {
    id: branch.id,
    branchName: branch.branchName,
    branchCode: branch.branchCode,
    email: branch.email,
    phone: branch.phone,
    city: branch.city,
    state: branch.state,
    country: branch.country,
    status: branch.status,
    deletedAt: branch.deletedAt,
    createdAt: branch.createdAt,
    updatedAt: branch.updatedAt,
  };

  return (
    <div className="space-y-4">
      <BranchManageHeader
        branch={branch}
        activeSection={activeSection}
        actionsDisabled={actionsDisabled}
        onEdit={() => setIsEditOpen(true)}
        onArchive={() => setIsArchiveOpen(true)}
        onRestore={() => setIsRestoreOpen(true)}
        onPermanentDelete={() =>
          setIsPermanentDeleteOpen(true)
        }
      />

      <BranchManageWorkspace
        branch={branch}
        summary={summary}
        summaryLoading={summaryLoading}
        onSummaryRefresh={refetchSummary}
        onTabChange={(tab) => {
          setActiveSection(TAB_LABELS[tab]);
        }}
      />

      <UpdateBranchModal
        open={isEditOpen}
        branch={branch}
        onClose={() => setIsEditOpen(false)}
        onSuccess={async (updated: Branch) => {
          setBranchData(updated);
          await refetch();
          await refetchSummary();
        }}
      />

      <DeleteBranchDialog
        open={isArchiveOpen}
        branch={listItem}
        isLoading={isArchiving}
        onClose={() => setIsArchiveOpen(false)}
        onConfirm={async () => {
          try {
            await deleteBranch(branch.id);
            setIsArchiveOpen(false);
            await refetch();
            await refetchSummary();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <RestoreBranchDialog
        open={isRestoreOpen}
        branch={listItem}
        isLoading={isRestoring}
        onClose={() => setIsRestoreOpen(false)}
        onConfirm={async () => {
          try {
            await restoreBranch(branch.id);
            setIsRestoreOpen(false);
            await refetch();
            await refetchSummary();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
      />

      <PermanentDeleteBranchDialog
        open={isPermanentDeleteOpen}
        branch={listItem}
        isLoading={isPermanentlyDeleting}
        onClose={() => setIsPermanentDeleteOpen(false)}
        onConfirm={async () => {
          const ok = await permanentDeleteBranch(branch.id);
          if (!ok) {
            return;
          }
          setIsPermanentDeleteOpen(false);
          router.push("/branches");
        }}
      />
    </div>
  );
}
