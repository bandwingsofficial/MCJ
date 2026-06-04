"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import {
  BranchUserListItem,
} from "@/src/features/branch-users/types/branch-user.types";

import { BranchUserStatusBadge } from "./branch-user-status-badge";
import { BranchUserActions } from "./branch-user-actions";

interface Props {
  branchUsers: BranchUserListItem[];
  includeDeleted?: boolean;
  onEdit: (branchUser: BranchUserListItem) => void;
  onActivate: (branchUser: BranchUserListItem) => void;
  onDeactivate: (branchUser: BranchUserListItem) => void;
  onResetPassword: (branchUser: BranchUserListItem) => void;
  onDelete: (branchUser: BranchUserListItem) => void;
  onRestore: (branchUser: BranchUserListItem) => void;
}

export const BranchUserTable = ({
  branchUsers,
  includeDeleted = false,
  onEdit,
  onActivate,
  onDeactivate,
  onResetPassword,
  onDelete,
  onRestore,
}: Props) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            Name
          </TableHead>
          <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            Email
          </TableHead>
          <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            Phone
          </TableHead>
          <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            Role
          </TableHead>
          <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            Branch ID
          </TableHead>
          <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            Status
          </TableHead>
          <TableHead className="font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            Last Login
          </TableHead>
          <TableHead className="text-right font-semibold text-xs tracking-wider text-muted-foreground uppercase">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {branchUsers.map((branchUser) => (
          <TableRow key={branchUser.id}>
            <TableCell className="font-medium">
              {branchUser.firstName} {branchUser.lastName}
            </TableCell>

            <TableCell>
              {branchUser.email}
            </TableCell>

            <TableCell>
              {branchUser.phone || "-"}
            </TableCell>

            <TableCell>
              {branchUser.role}
            </TableCell>

            <TableCell className="font-mono text-xs text-muted-foreground">
              {branchUser.branchId}
            </TableCell>

            <TableCell>
              <BranchUserStatusBadge 
                isActive={branchUser.isActive} 
              />
            </TableCell>

            <TableCell className="text-muted-foreground">
              {branchUser.lastLoginAt
                ? new Date(branchUser.lastLoginAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })
                : "-"}
            </TableCell>

            <TableCell className="text-right">
              <BranchUserActions
                isActive={branchUser.isActive}
                isDeleted={includeDeleted && !branchUser.isActive}
                onEdit={() => onEdit(branchUser)}
                onActivate={() => onActivate(branchUser)}
                onDeactivate={() => onDeactivate(branchUser)}
                onResetPassword={() => onResetPassword(branchUser)}
                onDelete={() => onDelete(branchUser)}
                onRestore={() => onRestore(branchUser)}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};