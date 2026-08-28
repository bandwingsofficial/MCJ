"use client";

import { useEffect, useMemo, useState } from "react";
import { KeyRound, Pencil, Plus, Power, Trash2 } from "lucide-react";

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
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { ListPageHeader } from "@/src/shared/components/ui/list-page-header";
import { Loader } from "@/src/shared/components/ui/loader";
import { RoleBadge } from "@/src/shared/components/ui/role-badge";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { TablePaginationBar } from "@/src/shared/components/ui/table-pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { appToast } from "@/src/shared/lib/toast";

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

  const allSelected = useMemo(
    () => items.length > 0 && items.every((item) => selected.includes(item.id)),
    [items, selected],
  );

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
    <div className="space-y-5">
      <ListPageHeader
        parentLabel="Branch Manager"
        currentLabel="Users"
        title="Users"
        totalLabel="Total Users"
        total={total}
        filters={
          <>
            <div className="w-full sm:w-[280px]">
              <SearchInput
                value={search}
                placeholder="Search users..."
                className="h-[46px] rounded-xl"
                onChange={setSearch}
              />
            </div>
            <div className="w-full sm:w-[180px]">
              <AppSelect
                value={role}
                triggerClassName="h-[46px] rounded-xl"
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
            <div className="w-full sm:w-[160px]">
              <AppSelect
                value={status}
                triggerClassName="h-[46px] rounded-xl"
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
              className="admin-create-btn h-[52px] shrink-0 px-5 font-semibold"
              onClick={() => {
                setEditing(null);
                setCreateOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create User
            </Button>
          </>
        }
      />

      {query.loading ? (
        <Loader />
      ) : query.error ? (
        <ErrorState description={query.error} onRetry={query.reload} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white">
          {!items.length ? (
            <EmptyState title="No users found." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={(checked) =>
                        setSelected(checked ? items.map((item) => item.id) : [])
                      }
                    />
                  </TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((user) => {
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
                    <TableRow key={user.id}>
                      <TableCell>
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
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E8F1FF] text-xs font-semibold text-[#2563EB]">
                            {initials || "U"}
                          </span>
                          <span className="font-medium text-[#102A56]">{name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || "—"}</TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "success" : "warning"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[#647A9B] hover:bg-[#F4F9FF] hover:text-[#2563EB]"
                            aria-label="Edit"
                            onClick={() => {
                              setEditing(user);
                              setCreateOpen(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[#647A9B] hover:bg-[#F4F9FF] hover:text-[#2563EB]"
                            aria-label="Reset password"
                            onClick={() => setResetUser(user)}
                          >
                            <KeyRound className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[#647A9B] hover:bg-[#F4F9FF] hover:text-[#2563EB]"
                            aria-label={user.isActive ? "Deactivate" : "Activate"}
                            onClick={() =>
                              setConfirm({
                                type: user.isActive ? "deactivate" : "activate",
                                user,
                              })
                            }
                          >
                            <Power className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-[#647A9B] hover:bg-red-50 hover:text-red-600"
                            aria-label="Delete"
                            onClick={() =>
                              setConfirm({
                                type: "delete",
                                user,
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          <TablePaginationBar
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
          />
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
