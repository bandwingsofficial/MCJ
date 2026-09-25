"use client";

import type { PortalAccountStatus } from "@/src/features/users/services/admin-users.service";

export function UserStatusBadge({
  status,
}: {
  status: PortalAccountStatus;
}) {
  const styles =
    status === "ACTIVE"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
      : status === "SUSPENDED"
        ? "bg-amber-50 text-amber-800 ring-amber-100"
        : "bg-slate-100 text-slate-600 ring-slate-200";

  return (
    <span
      className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${styles}`}
    >
      {status === "SUSPENDED" ? "Suspended" : status === "DELETED" ? "Deleted" : "Active"}
    </span>
  );
}
