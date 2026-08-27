"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";

import type { BranchUserListItem } from "@/src/features/branch-users/types/branch-user.types";

import { BranchUserStatusBadge } from "./branch-user-status-badge";
import { BranchUserActions } from "./branch-user-actions";

interface Props {
  branchUsers: BranchUserListItem[];
  actionsDisabled?: boolean;
  onEdit: (branchUser: BranchUserListItem) => void;
  onActivate: (branchUser: BranchUserListItem) => void;
  onDeactivate: (branchUser: BranchUserListItem) => void;
  onDelete: (branchUser: BranchUserListItem) => void;
  onResetPassword: (branchUser: BranchUserListItem) => void;
  onRestore: (branchUser: BranchUserListItem) => void;
  onPermanentDelete: (branchUser: BranchUserListItem) => void;
}

export function BranchUserTable({
  branchUsers,
  actionsDisabled = false,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onResetPassword,
  onRestore,
  onPermanentDelete,
}: Props) {
  return (
    <Table className="rounded-none border-0">
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[12rem]">Email</TableHead>
          <TableHead className="w-[8.5rem]">Phone</TableHead>
          <TableHead className="min-w-[9rem]">Role</TableHead>
          <TableHead className="w-[6.5rem]">Status</TableHead>
          <TableHead className="min-w-[9rem]">Last Login</TableHead>
          <TableHead className="w-[11.5rem] text-right">
            Actions
          </TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {branchUsers.map((branchUser) => (
          <TableRow key={branchUser.id}>
            <TableCell className="text-[15px] font-medium text-[#102A56]">
              {branchUser.email}
            </TableCell>

            <TableCell className="text-[15px] text-slate-700">
              {branchUser.phone || "—"}
            </TableCell>

            <TableCell className="text-[15px] text-slate-700">
              {branchUser.role}
            </TableCell>

            <TableCell>
              <BranchUserStatusBadge
                isActive={branchUser.isActive}
                isDeleted={Boolean(branchUser.isDeleted)}
              />
            </TableCell>

            <TableCell className="text-[15px] text-[#647A9B]">
              {branchUser.lastLoginAt
                ? new Date(branchUser.lastLoginAt).toLocaleString(
                    undefined,
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    },
                  )
                : "—"}
            </TableCell>

            <TableCell className="text-right">
              <BranchUserActions
                branchUser={branchUser}
                disabled={actionsDisabled}
                onEdit={onEdit}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
                onDelete={onDelete}
                onResetPassword={onResetPassword}
                onRestore={onRestore}
                onPermanentDelete={onPermanentDelete}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
