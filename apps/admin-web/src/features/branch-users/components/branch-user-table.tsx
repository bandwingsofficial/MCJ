"use client";

import type { BranchUserListItem } from "@/src/features/branch-users/types/branch-user.types";

import { BranchUserStatusBadge } from "./branch-user-status-badge";
import { BranchUserActions } from "./branch-user-actions";

const COLUMN_COUNT = 8;

interface Props {
  branchUsers: BranchUserListItem[];
  actionsDisabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onEdit: (branchUser: BranchUserListItem) => void;
  onActivate: (branchUser: BranchUserListItem) => void;
  onDeactivate: (branchUser: BranchUserListItem) => void;
  onDelete: (branchUser: BranchUserListItem) => void;
  onResetPassword: (branchUser: BranchUserListItem) => void;
  onRestore: (branchUser: BranchUserListItem) => void;
  onPermanentDelete: (branchUser: BranchUserListItem) => void;
}

function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function BranchUserTable({
  branchUsers,
  actionsDisabled = false,
  emptyTitle = "No Users Found",
  emptyDescription = "Create your first user or adjust your filters.",
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onResetPassword,
  onRestore,
  onPermanentDelete,
}: Props) {
  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          <col className="w-[14%]" />
          <col className="w-[18%]" />
          <col className="w-[11%]" />
          <col className="w-[12%]" />
          <col className="w-24" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[9rem]" />
        </colgroup>
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Name
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Email
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Phone
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Role
            </th>
            <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Deleted
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Last Login
            </th>
            <th className="w-[9rem] !px-4 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {branchUsers.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMN_COUNT}
                className="!px-4 !py-4 align-middle"
              >
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold">{emptyTitle}</h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    {emptyDescription}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            branchUsers.map((branchUser) => {
              const name =
                [branchUser.firstName, branchUser.lastName]
                  .filter(Boolean)
                  .join(" ") || "—";

              return (
                <tr
                  key={branchUser.id}
                  className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                >
                  <td className="!px-4 !py-4 align-middle">
                    <p
                      className="truncate text-sm font-medium leading-snug text-[#102A56]"
                      title={name}
                    >
                      {name}
                    </p>
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    <span
                      className="block truncate"
                      title={branchUser.email}
                    >
                      {branchUser.email}
                    </span>
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    <span
                      className="block truncate"
                      title={branchUser.phone || undefined}
                    >
                      {branchUser.phone || "—"}
                    </span>
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    <span className="block truncate" title={branchUser.role}>
                      {branchUser.role}
                    </span>
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <BranchUserStatusBadge
                      isActive={branchUser.isActive}
                      isDeleted={Boolean(branchUser.isDeleted)}
                    />
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-[#647A9B]">
                    <span className="block truncate">
                      {branchUser.isDeleted
                        ? formatDateTime(branchUser.updatedAt)
                        : "—"}
                    </span>
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-[#647A9B]">
                    <span className="block truncate">
                      {formatDateTime(branchUser.lastLoginAt)}
                    </span>
                  </td>
                  <td className="!px-4 !py-4 align-middle">
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
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
