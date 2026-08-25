"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BranchAssignStudentModal } from "@/src/features/branches/components/manage/branch-assign-student-modal";
import { BranchManageCardGrid } from "@/src/features/branches/components/manage/branch-manage-card-grid";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import { BranchStudentEnrolledCard } from "@/src/features/branches/components/manage/branch-student-enrolled-card";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { studentManagePath } from "@/src/features/students/utils/student-manage.routes";

const PAGE_SIZE = 10;

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  assignOnMount?: boolean;
  onAssignOnMountHandled?: () => void;
  onSummaryRefresh?: () => Promise<void>;
}

export function BranchManageStudentsEnrolledPanel({
  branchId,
  assignmentsDisabled = false,
  assignOnMount = false,
  onAssignOnMountHandled,
  onSummaryRefresh,
}: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<Enrollment | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await enrollmentService.getEnrollments({
        search,
        branchId,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });
      const parsed = parseEnrollmentListResponse(response);
      setEnrollments(parsed.items);
      setTotal(parsed.total);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setEnrollments([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [branchId, page, search]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (!assignOnMount || assignmentsDisabled) {
      return;
    }

    setAssignOpen(true);
    onAssignOnMountHandled?.();
  }, [assignOnMount, assignmentsDisabled, onAssignOnMountHandled]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleRemove = async () => {
    if (!removeTarget) {
      return;
    }

    setIsRemoving(true);
    try {
      await enrollmentService.deleteEnrollment(removeTarget.id);
      appToast.success("Enrollment removed");
      setRemoveTarget(null);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsRemoving(false);
    }
  };

  const formatRemoveStudentName = (enrollment: Enrollment): string =>
    formatPersonName(
      enrollment.student?.firstName,
      enrollment.student?.lastName,
    );

  return (
    <>
      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <BranchSectionToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search enrolled students..."
          assignLabel="Assign Student"
          onAssign={() => setAssignOpen(true)}
          assignDisabled={assignmentsDisabled}
        />

        <BranchManageCardGrid
          isLoading={isLoading}
          isEmpty={!isLoading && enrollments.length === 0}
          emptyMessage="No Students Enrolled Yet"
          emptyDescription="Assign students to a branch batch to create enrollments."
          columnsClassName="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {enrollments.map((enrollment) => (
            <BranchStudentEnrolledCard
              key={enrollment.id}
              enrollment={enrollment}
              removeDisabled={assignmentsDisabled || isRemoving}
              onRemove={assignmentsDisabled ? undefined : setRemoveTarget}
              onManage={(studentId) => router.push(studentManagePath(studentId))}
            />
          ))}
        </BranchManageCardGrid>

        {!isLoading && enrollments.length > 0 ? (
          <div className="mt-4">
            <Pagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </Card>

      <BranchAssignStudentModal
        open={assignOpen}
        branchId={branchId}
        onClose={() => setAssignOpen(false)}
        onSuccess={async () => {
          await loadData();
          await onSummaryRefresh?.();
        }}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove enrollment?"
        description={
          removeTarget
            ? `Remove ${formatRemoveStudentName(removeTarget)} from ${removeTarget.batch?.name ?? "this batch"}? The student profile will remain in the system.`
            : ""
        }
        confirmLabel="Remove"
        loading={isRemoving}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          void handleRemove();
        }}
      />
    </>
  );
}
