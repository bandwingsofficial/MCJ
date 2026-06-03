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
  onRestore,
  onToggleStatus,
}: BranchTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
            Branch Name
          </TableHead>

          <TableHead>
            Code
          </TableHead>

          <TableHead>
            Email
          </TableHead>

          <TableHead>
            Phone
          </TableHead>

          <TableHead>
            City
          </TableHead>

          <TableHead>
            State
          </TableHead>

          <TableHead>
            Status
          </TableHead>

          <TableHead>
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
              <TableCell>
                {
                  branch.branchName
                }
              </TableCell>

              <TableCell>
                {
                  branch.branchCode
                }
              </TableCell>

              <TableCell>
                {branch.email}
              </TableCell>

              <TableCell>
                {branch.phone}
              </TableCell>

              <TableCell>
                {branch.city}
              </TableCell>

              <TableCell>
                {branch.state}
              </TableCell>

              <TableCell>
                <BranchStatusBadge
                  status={
                    branch.status
                  }
                />
              </TableCell>

              <TableCell>
                <Dropdown
                  trigger={
                    <Button
                      variant="outline"
                    >
                      Actions
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