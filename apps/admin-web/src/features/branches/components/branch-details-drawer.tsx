"use client";

import { Drawer } from "@/src/shared/components/ui/drawer";

import { Separator } from "@/src/shared/components/ui/separator";

import { Branch } from "@/src/features/branches/types/branch.types";

import { BranchStatusBadge } from "./branch-status-badge";

interface BranchDetailsDrawerProps {
  open: boolean;

  branch: Branch | null;

  onClose: () => void;
}

export function BranchDetailsDrawer({
  open,
  branch,
  onClose,
}: BranchDetailsDrawerProps) {
  if (!branch) {
    return null;
  }

  const rows = [
    {
      label: "Branch Name",
      value: branch.branchName,
    },
    {
      label: "Branch Code",
      value: branch.branchCode,
    },
    {
      label: "Email",
      value: branch.email,
    },
    {
      label: "Phone",
      value: branch.phone,
    },
    {
      label: "Address Line 1",
      value: branch.addressLine1,
    },
    {
      label: "Address Line 2",
      value:
        branch.addressLine2 ??
        "-",
    },
    {
      label: "City",
      value: branch.city,
    },
    {
      label: "State",
      value: branch.state,
    },
    {
      label: "Country",
      value: branch.country,
    },
    {
      label: "Postal Code",
      value: branch.postalCode,
    },
    {
      label: "Latitude",
      value:
        branch.latitude.toString(),
    },
    {
      label: "Longitude",
      value:
        branch.longitude.toString(),
    },
    {
      label: "Description",
      value:
        branch.description ??
        "-",
    },
  ];

  return (
    <Drawer
      open={open}
      title="Branch Details"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div>
          <BranchStatusBadge
            status={branch.status}
          />
        </div>

        <Separator />

        {rows.map((row) => (
          <div
            key={row.label}
            className="space-y-1"
          >
            <p className="text-xs text-muted-foreground">
              {row.label}
            </p>

            <p className="font-medium">
              {row.value}
            </p>
          </div>
        ))}

        <Separator />

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Created At
          </p>

          <p>
            {new Date(
              branch.createdAt
            ).toLocaleString()}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            Updated At
          </p>

          <p>
            {new Date(
              branch.updatedAt
            ).toLocaleString()}
          </p>
        </div>
      </div>
    </Drawer>
  );
}