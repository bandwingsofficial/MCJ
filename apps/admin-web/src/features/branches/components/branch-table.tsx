"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import { Dropdown } from "@/src/shared/components/ui/dropdown";

import { Button } from "@/src/shared/components/ui/button";

import { MoreVertical } from "lucide-react";

import {
  BranchListItem,
} from "@/src/features/branches/types/branch.types";

import { BranchStatusBadge } from "./branch-status-badge";

interface BranchTableProps {
  branches: BranchListItem[];

  onView: (
    branch: BranchListItem
  ) => void;

  onEdit: (
    branch: BranchListItem
  ) => void;

  onDelete: (
    branch: BranchListItem
  ) => void;

  onPermanentDelete: (
    branch: BranchListItem
  ) => void;

  onRestore: (
    branch: BranchListItem
  ) => void;

  onToggleStatus: (
    branch: BranchListItem
  ) => void;
}

export function BranchTable({
  branches,
  onView,
  onEdit,
  onDelete,
  onPermanentDelete,
  onRestore,
  onToggleStatus,
}: BranchTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="py-1">
            Branch Name
          </TableHead>

          <TableHead className="py-1">
            Code
          </TableHead>

          <TableHead className="py-1">
            Email
          </TableHead>

          <TableHead className="py-1">
            Phone
          </TableHead>

          <TableHead className="py-1">
            City
          </TableHead>

          <TableHead className="py-1">
            State
          </TableHead>

          <TableHead className="py-1">
            Status
          </TableHead>

          <TableHead className="py-1">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {branches.map(
          (branch) => (
            <TableRow
              key={branch.id}
            >
              <TableCell className="py-1">
                {
                  branch.branchName
                }
              </TableCell>

              <TableCell className="py-1">
                {
                  branch.branchCode
                }
              </TableCell>

              <TableCell className="py-1">
                {branch.email}
              </TableCell>

              <TableCell className="py-1">
                {branch.phone}
              </TableCell>

              <TableCell className="py-1">
                {branch.city}
              </TableCell>

              <TableCell className="py-1">
                {branch.state}
              </TableCell>

              <TableCell className="py-1">
                <BranchStatusBadge
                  status={
                    branch.status
                  }
                />
              </TableCell>

              <TableCell className="py-1">
                <Dropdown
                  trigger={
                    <Button
                      variant="outline"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  }
                  items={[
                    {
                      label:
                        "View",
                      onClick:
                        () =>
                          onView(
                            branch
                          ),
                    },

                    {
                      label:
                        "Edit",
                      onClick:
                        () =>
                          onEdit(
                            branch
                          ),
                    },

                    {
                      label:
                        branch.status ===
                        "ACTIVE"
                          ? "Deactivate"
                          : "Activate",

                      onClick:
                        () =>
                          onToggleStatus(
                            branch
                          ),
                    },

                    {
                      label:
                        "Delete",

                      onClick:
                        () =>
                          onDelete(
                            branch
                          ),
                    },
                    {
                      label:
                        "Delete permanently",

                      onClick:
                        () =>
                          onPermanentDelete(
                            branch
                          ),
                    },

                    {
                      label:
                        "Restore",

                      onClick:
                        () =>
                          onRestore(
                            branch
                          ),
                    },
                  ]}
                />
              </TableCell>
            </TableRow>
          )
        )}
      </TableBody>
    </Table>
  );
}