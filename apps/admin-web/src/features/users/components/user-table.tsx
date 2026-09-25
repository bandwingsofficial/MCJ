"use client";

import { Tooltip } from "@/src/shared/components/ui/tooltip";

import type { AdminUserListItem } from "@/src/features/users/services/admin-users.service";

import { UserRowActions } from "./user-row-actions";
import { UserStatusBadge } from "./user-status-badge";

interface UserTableProps {
  users: AdminUserListItem[];
  actionsDisabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onView: (user: AdminUserListItem) => void;
  onSuspend: (user: AdminUserListItem) => void;
  onUnsuspend: (user: AdminUserListItem) => void;
  onPermanentDelete: (user: AdminUserListItem) => void;
}

function formatCreatedDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function UserTable({
  users,
  actionsDisabled = false,
  emptyTitle = "No Users Yet",
  emptyDescription = "Portal users will appear here.",
  onView,
  onSuspend,
  onUnsuspend,
  onPermanentDelete,
}: UserTableProps) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            <th className="min-w-[10rem] !px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              User
            </th>
            <th className="whitespace-nowrap !px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Phone Number
            </th>
            <th className="whitespace-nowrap !px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Referral Code
            </th>
            <th className="whitespace-nowrap !px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Account Status
            </th>
            <th className="whitespace-nowrap !px-4 !py-3 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Created At
            </th>
            <th className="w-[6.75rem] whitespace-nowrap !px-4 !py-3 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {users.length === 0 ? (
            <tr>
              <td colSpan={6} className="!px-4 !py-4 align-middle">
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold text-[#102A56]">
                    {emptyTitle}
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    {emptyDescription}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr
                key={user.id}
                className={`border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                  user.accountStatus === "DELETED"
                    ? "bg-slate-50/40"
                    : "bg-white"
                }`}
              >
                <td className="max-w-[14rem] !px-4 !py-3 align-middle">
                  <p className="truncate text-sm font-medium leading-snug text-[#102A56]">
                    {user.name}
                  </p>
                  {user.email ? (
                    <Tooltip content={user.email}>
                      <span className="mt-0.5 block truncate text-xs text-[#647A9B]">
                        {user.email}
                      </span>
                    </Tooltip>
                  ) : null}
                </td>

                <td className="whitespace-nowrap !px-4 !py-3 align-middle text-sm text-slate-700">
                  {user.phone ?? "—"}
                </td>

                <td className="whitespace-nowrap !px-4 !py-3 align-middle font-mono text-xs text-slate-700">
                  {user.referralCode ?? "—"}
                </td>

                <td className="whitespace-nowrap !px-4 !py-3 align-middle">
                  <UserStatusBadge status={user.accountStatus} />
                </td>

                <td className="whitespace-nowrap !px-4 !py-3 align-middle text-sm tabular-nums text-slate-700">
                  {formatCreatedDate(user.createdAt)}
                </td>

                <td className="!px-4 !py-3 text-right align-middle">
                  <UserRowActions
                    user={user}
                    disabled={actionsDisabled}
                    onView={onView}
                    onSuspend={onSuspend}
                    onUnsuspend={onUnsuspend}
                    onPermanentDelete={onPermanentDelete}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
