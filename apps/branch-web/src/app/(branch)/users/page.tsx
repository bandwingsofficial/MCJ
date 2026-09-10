"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Archive,
  ChevronRight,
  CircleCheck,
  KeyRound,
  Pencil,
  Plus,
  Power,
} from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  parseBranchOpsError,
  userFacingApiMessage,
} from "@/src/features/branch-ops/api/parse-api-error";
import { CreateBranchStaffModal } from "@/src/features/branch-ops/components/create-user-modal";
import { ResetPasswordModal } from "@/src/features/branch-ops/components/reset-password-modal";
import type { BranchUserItem } from "@/src/features/branch-ops/types";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { CategoryPagination } from "@/src/shared/components/ui/category-pagination";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { RoleBadge } from "@/src/shared/components/ui/role-badge";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { Tooltip } from "@/src/shared/components/ui/tooltip";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { cn } from "@/src/shared/lib/cn";
import { appToast } from "@/src/shared/lib/toast";

const iconButtonClass =
  "inline-flex h-5 w-5 shrink-0 items-center justify-center border-0 bg-transparent p-0 leading-none transition-colors hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40";

const iconClass = "h-[15px] w-[14px] stroke-[2]";

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

function UserStatusBadge({ isActive }: { isActive: boolean }) {
  if (isActive) {
    return (
      <Badge variant="success" className={compactBadgeClass}>
        Active
      </Badge>
    );
  }

  return (
    <Badge
      variant="warning"
      className={cn(compactBadgeClass, "bg-orange-50 text-orange-800")}
    >
      Inactive
    </Badge>
  );
}

export default function BranchUsersPage() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [role, setRole] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BranchUserItem | null>(null);
  const [resetUser, setResetUser] = useState<BranchUserItem | null>(null);
  const [confirm, setConfirm] = useState<{
    type: "activate" | "deactivate" | "delete";
    user: BranchUserItem;
  } | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const selectAllRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useAsyncData(
    () =>
      branchOpsApi.users({
        search: debouncedSearch || undefined,
        role: role === "ALL" ? undefined : role,
        status,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    [debouncedSearch, role, status, page, pageSize],
  );

  const items = query.data?.items ?? [];
  const total = query.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);
  const columnCount = 7;

  const allSelected = useMemo(
    () => items.length > 0 && items.every((item) => selected.includes(item.id)),
    [items, selected],
  );
  const someSelected = useMemo(
    () => selected.length > 0 && !allSelected,
    [selected.length, allSelected],
  );

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected, allSelected]);

  const runConfirm = async () => {
    if (!confirm) return;
    try {
      setConfirmLoading(true);
      if (confirm.type === "activate") {
        await branchOpsApi.activateUser(confirm.user.id);
        appToast.success("User activated");
      } else if (confirm.type === "deactivate") {
        await branchOpsApi.deactivateUser(confirm.user.id);
        appToast.success("User deactivated");
      } else {
        await branchOpsApi.deleteUser(confirm.user.id);
        appToast.success("User deleted");
      }
      setConfirm(null);
      await query.reload();
    } catch (error) {
      appToast.error(userFacingApiMessage(parseBranchOpsError(error)));
    } finally {
      setConfirmLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <header className="px-1 py-1">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between lg:gap-4">
          <div className="min-w-0 space-y-1">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1 text-xs"
            >
              <Link
                href="/dashboard"
                className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
              >
                Branch Manager
              </Link>
              <ChevronRight
                className="h-3.5 w-3.5 text-slate-400"
                aria-hidden="true"
              />
              <span aria-current="page" className="font-medium text-[#102A56]">
                Users
              </span>
            </nav>

            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
                Users
              </h1>
              <span className="text-xs text-[#647A9B] sm:text-[13px]">
                Total Users:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {query.loading ? "—" : total}
                </span>
              </span>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center lg:w-auto lg:shrink-0">
            <div className="w-full sm:w-[280px]">
              <SearchInput
                value={search}
                placeholder="Search users..."
                className="h-9 rounded-lg !py-1.5 pl-9 text-sm"
                onChange={setSearch}
              />
            </div>
            <div className="w-full sm:w-[140px]">
              <AppSelect
                value={role}
                triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                onValueChange={(value) => {
                  setRole(value);
                  setPage(1);
                }}
                options={[
                  { label: "All Role", value: "ALL" },
                  { label: "Faculty", value: "FACULTY" },
                  { label: "Interviewer", value: "INTERVIEWER" },
                ]}
              />
            </div>
            <div className="w-full sm:w-[140px]">
              <AppSelect
                value={status}
                triggerClassName="h-9 rounded-lg px-2.5 text-sm"
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(1);
                }}
                options={[
                  { label: "All Status", value: "ALL" },
                  { label: "Active", value: "ACTIVE" },
                  { label: "Inactive", value: "INACTIVE" },
                ]}
              />
            </div>
            <Button
              type="button"
              className="h-11 w-full shrink-0 border-0 bg-gradient-to-r from-[#0EA5E9] to-[#2563EB] px-6 text-sm font-semibold text-white shadow-[0_3px_10px_rgba(37,99,235,0.25)] transition-all hover:from-[#0284C7] hover:to-[#1D4ED8] hover:shadow-[0_4px_12px_rgba(37,99,235,0.3)] sm:w-auto"
              onClick={() => {
                setEditing(null);
                setCreateOpen(true);
              }}
            >
              <Plus className="mr-1 h-4 w-4" />
              Create User
            </Button>
          </div>
        </div>
      </header>

      {query.loading ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <SkeletonTable rows={8} />
        </div>
      ) : query.error ? (
        <ErrorState description={query.error} onRetry={query.reload} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white p-0 shadow-sm">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
                <tr>
                  <th className="w-9 !px-6 !py-4 text-left">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      className="h-3.5 w-3.5 rounded border-slate-300"
                      checked={allSelected}
                      onChange={(event) =>
                        setSelected(
                          event.target.checked ? items.map((item) => item.id) : [],
                        )
                      }
                      aria-label="Select all users on this page"
                    />
                  </th>
                  <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
                    User
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
                  <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columnCount}
                      className="!px-4 !py-4 align-middle"
                    >
                      <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                        <h3 className="text-base font-semibold">
                          No Users Found
                        </h3>
                        <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                          Create your first user or adjust your filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((user) => {
                    const name = [user.firstName, user.lastName]
                      .filter(Boolean)
                      .join(" ");
                    const initials = name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr
                        key={user.id}
                        className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                      >
                        <td className="!px-6 !py-4 align-middle">
                          <Checkbox
                            checked={selected.includes(user.id)}
                            onCheckedChange={(checked) =>
                              setSelected((current) =>
                                checked
                                  ? [...current, user.id]
                                  : current.filter((id) => id !== user.id),
                              )
                            }
                          />
                        </td>
                        <td className="!px-4 !py-4 align-middle">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F1FF] text-xs font-semibold text-[#2563EB]">
                              {initials || "U"}
                            </span>
                            <span className="text-sm font-medium leading-snug text-[#102A56]">
                              {name}
                            </span>
                          </div>
                        </td>
                        <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                          {user.email}
                        </td>
                        <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                          {user.phone || "—"}
                        </td>
                        <td className="!px-4 !py-4 align-middle">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="!px-4 !py-4 align-middle">
                          <UserStatusBadge isActive={user.isActive} />
                        </td>
                        <td className="!px-8 !py-4 text-right align-middle">
                          <div className="flex items-center justify-end gap-2">
                            <Tooltip
                              content={
                                user.isActive ? "Deactivate user" : "Activate user"
                              }
                            >
                              <button
                                type="button"
                                className={`${iconButtonClass} text-orange-700`}
                                aria-label={
                                  user.isActive ? "Deactivate user" : "Activate user"
                                }
                                onClick={() =>
                                  setConfirm({
                                    type: user.isActive ? "deactivate" : "activate",
                                    user,
                                  })
                                }
                              >
                                {user.isActive ? (
                                  <Power className={iconClass} />
                                ) : (
                                  <CircleCheck className={iconClass} />
                                )}
                              </button>
                            </Tooltip>

                            <Tooltip content="Edit user">
                              <button
                                type="button"
                                className={`${iconButtonClass} text-blue-900`}
                                aria-label="Edit user"
                                onClick={() => {
                                  setEditing(user);
                                  setCreateOpen(true);
                                }}
                              >
                                <Pencil className={iconClass} />
                              </button>
                            </Tooltip>

                            <Tooltip content="Reset password">
                              <button
                                type="button"
                                className={`${iconButtonClass} text-green-800`}
                                aria-label="Reset password"
                                onClick={() => setResetUser(user)}
                              >
                                <KeyRound className={iconClass} />
                              </button>
                            </Tooltip>

                            <Tooltip content="Delete user">
                              <button
                                type="button"
                                className={`${iconButtonClass} text-red-800`}
                                aria-label="Delete user"
                                onClick={() =>
                                  setConfirm({
                                    type: "delete",
                                    user,
                                  })
                                }
                              >
                                <Archive className={iconClass} />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
              <span>
                Showing {from}–{to} of {total}
              </span>
              <label className="flex items-center gap-1.5">
                <span className="whitespace-nowrap">Rows per page</span>
                <select
                  className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                  value={pageSize}
                  onChange={(event) => {
                    setPageSize(Number(event.target.value));
                    setPage(1);
                  }}
                >
                  {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <CategoryPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        </div>
      )}

      <CreateBranchStaffModal
        open={createOpen}
        user={editing}
        onClose={() => {
          setCreateOpen(false);
          setEditing(null);
        }}
        onSuccess={() => {
          void query.reload();
        }}
      />

      <ResetPasswordModal
        open={Boolean(resetUser)}
        userId={resetUser?.id ?? ""}
        onClose={() => setResetUser(null)}
        onSuccess={() => {
          setResetUser(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirm)}
        title={
          confirm?.type === "activate"
            ? "Activate user"
            : confirm?.type === "delete"
              ? "Delete User?"
              : "Deactivate user"
        }
        description={
          confirm?.type === "activate"
            ? "This user will be able to sign in again."
            : confirm?.type === "delete"
              ? "This user will be removed from the active list and will no longer be able to sign in."
              : "This user will no longer be able to sign in."
        }
        confirmLabel={
          confirm?.type === "activate"
            ? "Activate"
            : confirm?.type === "delete"
              ? "Delete"
              : "Deactivate"
        }
        confirmVariant={confirm?.type === "activate" ? "primary" : "danger"}
        loading={confirmLoading}
        onConfirm={() => {
          void runConfirm();
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
