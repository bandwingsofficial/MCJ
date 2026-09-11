"use client";

import { useMemo, useState } from "react";
import { Briefcase, Eye, Pencil } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import {
  BRANCH_ICON_BUTTON_CLASS,
  BRANCH_ICON_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-section";
import { BRANCH_TABLE_CARD_CLASS } from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import { BranchManagePaginationFooter } from "@/src/features/branches/components/manage/branch-manage-pagination-footer";
import {
  BranchManageTableShell,
  TABLE_CELL_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { PlacementDetailsDrawer } from "@/src/features/placements/components/placement-details-drawer";
import { PlacementStatusBadge } from "@/src/features/placements/components/placement-status-badge";
import { UpdatePlacementModal } from "@/src/features/placements/components/update-placement-dialog";
import { usePlacements } from "@/src/features/placements/hooks/usePlacements";
import { useUpdatePlacement } from "@/src/features/placements/hooks/useUpdatePlacement";
import type {
  Placement,
  UpdatePlacementRequest,
} from "@/src/features/placements/types/placement.types";
import type { Student } from "@/src/features/students/types/student.types";

const PLACEMENT_COLUMNS = [
  { key: "company", label: "Company" },
  { key: "designation", label: "Designation" },
  { key: "salary", label: "Salary" },
  { key: "joining", label: "Joining Date" },
  { key: "status", label: "Status" },
  { key: "actions", label: "Actions", className: "w-24 text-right" },
];

const DEFAULT_PAGE_SIZE = 10;

interface Props {
  student: Student;
}

export function StudentManagePlacementPanel({
  student,
}: Props) {
  const { placements, isLoading, error, refetch } = usePlacements();
  const { updatePlacement, isUpdating } = useUpdatePlacement();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedPlacement, setSelectedPlacement] = useState<Placement | null>(
    null,
  );
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);

  const studentPlacements = useMemo(
    () => placements.filter((placement) => placement.studentId === student.id),
    [placements, student.id],
  );

  const total = studentPlacements.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(safePage * pageSize, total);

  const paginatedPlacements = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return studentPlacements.slice(start, start + pageSize);
  }, [studentPlacements, safePage, pageSize]);

  const handleView = (placement: Placement) => {
    setSelectedPlacement(placement);
    setDetailsOpen(true);
  };

  const handleEdit = (placement: Placement) => {
    setSelectedPlacement(placement);
    setUpdateOpen(true);
  };

  const handleUpdate = async (payload: UpdatePlacementRequest) => {
    if (!selectedPlacement) {
      return false;
    }

    const response = await updatePlacement(selectedPlacement.id, payload);

    if (!response) {
      return false;
    }

    await refetch();
    return true;
  };

  if (error) {
    return (
      <ErrorState
        title="Unable to load placements"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
          Placement
        </h2>
        <p className="text-xs text-[#647A9B] sm:text-[13px]">
          Placement records for {student.studentCode}
        </p>
      </div>

      <Card className={BRANCH_TABLE_CARD_CLASS}>
        <BranchManageTableShell
          columns={PLACEMENT_COLUMNS}
          isLoading={isLoading}
          isEmpty={!isLoading && total === 0}
          emptyTitle="No placements found"
          emptyDescription="No placement records are linked to this student yet."
          emptyIcon={Briefcase}
          embedded
        >
          {paginatedPlacements.map((placement) => (
            <tr
              key={placement.id}
              className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
            >
              <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                {placement.companyName}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {placement.designation}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                ₹{placement.salary.toLocaleString("en-IN")}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {placement.joiningDate
                  ? new Date(placement.joiningDate).toLocaleDateString("en-IN")
                  : "—"}
              </td>
              <td className={TABLE_CELL_CLASS}>
                <PlacementStatusBadge status={placement.status} />
              </td>
              <td className={`${TABLE_CELL_CLASS} text-right`}>
                <div className="flex items-center justify-end gap-2">
                  <Tooltip content="View details">
                    <button
                      type="button"
                      onClick={() => handleView(placement)}
                      aria-label="View placement details"
                      className={`${BRANCH_ICON_BUTTON_CLASS} text-[#2563EB]`}
                    >
                      <Eye className={BRANCH_ICON_CLASS} />
                    </button>
                  </Tooltip>
                  <Tooltip content="Update placement">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleEdit(placement)}
                      aria-label="Update placement"
                      className={`${BRANCH_ICON_BUTTON_CLASS} text-green-800`}
                    >
                      <Pencil className={BRANCH_ICON_CLASS} />
                    </button>
                  </Tooltip>
                </div>
              </td>
            </tr>
          ))}
        </BranchManageTableShell>

        <BranchManagePaginationFooter
          from={from}
          to={to}
          total={total}
          page={safePage}
          pageSize={pageSize}
          totalPages={totalPages}
          disabled={isLoading}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
      </Card>

      <PlacementDetailsDrawer
        open={detailsOpen}
        placement={selectedPlacement}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedPlacement(null);
        }}
      />

      <UpdatePlacementModal
        open={updateOpen}
        placement={selectedPlacement}
        isSubmitting={isUpdating}
        onClose={() => {
          setUpdateOpen(false);
          setSelectedPlacement(null);
        }}
        onSubmit={handleUpdate}
      />
    </div>
  );
}
