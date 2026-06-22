"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import { PlacementActions } from "@/src/features/placements/components/placement-actions";

import { PlacementStatusBadge } from "@/src/features/placements/components/placement-status-badge";

import type {
  Placement,
} from "@/src/features/placements/types/placement.types";

interface PlacementTableProps {
  placements: Placement[];

  onView: (
    placement: Placement,
  ) => void;

  onEdit: (
    placement: Placement,
  ) => void;
}

export function PlacementTable({
  placements,
  onView,
  onEdit,
}: PlacementTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            Student
          </TableHead>

          <TableHead>
            Student Code
          </TableHead>

          <TableHead>
            Company
          </TableHead>

          <TableHead>
            Designation
          </TableHead>

          <TableHead>
            Salary
          </TableHead>

          <TableHead>
            Joining Date
          </TableHead>

          <TableHead>
            Status
          </TableHead>

          <TableHead className="w-24 text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {placements.map(
          (placement) => (
            <TableRow
              key={placement.id}
            >
              <TableCell>
                {placement.student.firstName}{" "}
                {
                  placement.student
                    .lastName
                }
              </TableCell>

              <TableCell>
                {
                  placement.student
                    .studentCode
                }
              </TableCell>

              <TableCell>
                {
                  placement.companyName
                }
              </TableCell>

              <TableCell>
                {
                  placement.designation
                }
              </TableCell>

              <TableCell>
                ₹
                {placement.salary.toLocaleString(
                  "en-IN",
                )}
              </TableCell>

              <TableCell>
                {placement.joiningDate
                  ? new Date(
                      placement.joiningDate,
                    ).toLocaleDateString(
                      "en-IN",
                    )
                  : "-"}
              </TableCell>

              <TableCell>
                <PlacementStatusBadge
                  status={
                    placement.status
                  }
                />
              </TableCell>

              <TableCell className="text-right">
                <PlacementActions
                  placement={
                    placement
                  }
                  onView={onView}
                  onEdit={onEdit}
                />
              </TableCell>
            </TableRow>
          ),
        )}
      </TableBody>
    </Table>
  );
}