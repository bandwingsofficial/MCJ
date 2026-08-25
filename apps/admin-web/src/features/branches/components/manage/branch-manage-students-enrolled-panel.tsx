"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card } from "@/src/shared/components/ui/card";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchManageCardGrid } from "@/src/features/branches/components/manage/branch-manage-card-grid";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import { BranchStudentEnrolledCard } from "@/src/features/branches/components/manage/branch-student-enrolled-card";
import { assignStudentToBranch } from "@/src/features/branches/utils/branch-assign.utils";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { parseEnrollmentListResponse } from "@/src/features/enrollments/utils/enrollment-list.utils";
import { studentService } from "@/src/features/students/services/student.service";
import { isArchivedStudent } from "@/src/features/students/utils/student-bulk.utils";
import { parseStudentListResponse } from "@/src/features/students/utils/student-list.utils";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";
import { studentManageTabPath } from "@/src/features/students/utils/student-manage.routes";

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
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>(
    [],
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

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

  const openAssign = useCallback(async () => {
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const response = await studentService.getStudents({
        includeDeleted: false,
        page: 1,
        pageSize: 200,
      });
      const payload = parseStudentListResponse(response.data);

      setAssignCandidates(
        payload.items
          .filter(
            (item) =>
              item.isActive &&
              !isArchivedStudent(item) &&
              item.branchId !== branchId,
          )
          .map((item) => ({
            id: item.id,
            label: formatPersonName(item.firstName, item.lastName),
            meta: item.studentCode ?? item.email ?? undefined,
          })),
      );
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAssignLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    if (!assignOnMount || assignmentsDisabled) {
      return;
    }

    void openAssign();
    onAssignOnMountHandled?.();
  }, [
    assignOnMount,
    assignmentsDisabled,
    onAssignOnMountHandled,
    openAssign,
  ]);

  const handleAssign = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    setAssignSubmitting(true);
    try {
      for (const id of ids) {
        await assignStudentToBranch(id, branchId);
      }
      appToast.success(
        ids.length === 1
          ? "Student assigned successfully"
          : `${ids.length} students assigned successfully`,
      );
      setAssignOpen(false);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <BranchSectionToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search enrolled students..."
          assignLabel="Assign Student"
          onAssign={() => {
            void openAssign();
          }}
          assignDisabled={assignmentsDisabled}
        />

        <BranchManageCardGrid
          isLoading={isLoading}
          isEmpty={!isLoading && enrollments.length === 0}
          emptyMessage="No Students Enrolled Yet"
          emptyDescription="Assign students to this branch or enroll them in branch batches."
          columnsClassName="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {enrollments.map((enrollment) => (
            <BranchStudentEnrolledCard
              key={enrollment.id}
              enrollment={enrollment}
              onManage={(studentId) =>
                router.push(studentManageTabPath(studentId, "enrollments"))
              }
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

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Students"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search active students..."
        emptyMessage="No active students available to assign"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />
    </>
  );
}
