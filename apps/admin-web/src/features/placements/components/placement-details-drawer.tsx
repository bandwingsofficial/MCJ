"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Drawer } from "@/src/shared/components/ui/drawer";

import { PlacementStatusBadge } from "@/src/features/placements/components/placement-status-badge";

import type {
  Placement,
} from "@/src/features/placements/types/placement.types";

interface PlacementDetailsDrawerProps {
  open: boolean;

  placement: Placement | null;

  onClose: () => void;
}

export function PlacementDetailsDrawer({
  open,
  placement,
  onClose,
}: PlacementDetailsDrawerProps) {
  if (!placement) {
    return null;
  }

  return (
    <Drawer
      open={open}
      title="Placement Details"
      onClose={onClose}
    >
      <div className="space-y-4">
        <Card>
          <div className="space-y-3">
            <h3 className="font-semibold">
              Student Information
            </h3>

            <div>
              <strong>Name:</strong>{" "}
              {placement.student.firstName}{" "}
              {placement.student.lastName}
            </div>

            <div>
              <strong>Student Code:</strong>{" "}
              {placement.student.studentCode}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h3 className="font-semibold">
              Job Information
            </h3>

            <div>
              <strong>Company:</strong>{" "}
              {placement.companyName}
            </div>

            <div>
              <strong>Designation:</strong>{" "}
              {placement.designation}
            </div>

            <div>
              <strong>Salary:</strong> ₹
              {placement.salary.toLocaleString(
                "en-IN",
              )}
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <h3 className="font-semibold">
              Placement Status
            </h3>

            <PlacementStatusBadge
              status={placement.status}
            />

            <div>
              <strong>Joining Date:</strong>{" "}
              {placement.joiningDate
                ? new Date(
                    placement.joiningDate,
                  ).toLocaleDateString(
                    "en-IN",
                  )
                : "-"}
            </div>

            <div>
              <strong>Remarks:</strong>{" "}
              {placement.remarks ?? "-"}
            </div>
          </div>
        </Card>
      </div>
    </Drawer>
  );
}