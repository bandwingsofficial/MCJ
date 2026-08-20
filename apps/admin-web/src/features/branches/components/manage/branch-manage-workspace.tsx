"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2Off } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { appToast } from "@/src/shared/components/ui/toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import type { Branch } from "@/src/features/branches/types/branch.types";
import type { BranchSummaryCounts } from "@/src/features/branches/hooks/use-branch-summary";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import { formatPersonName } from "@/src/features/branches/utils/branch-display.utils";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "./assign-entities-modal";
import { BranchIconAction } from "./branch-icon-action";
import { BranchManageBatchesPanel } from "./branch-manage-batches-panel";
import { BranchManageCategoriesPanel } from "./branch-manage-categories-panel";
import { BranchManageCoursesPanel } from "./branch-manage-courses-panel";
import { BranchManageEnrollmentsPanel } from "./branch-manage-enrollments-panel";
import { BranchManageStudentsPanel } from "./branch-manage-students-panel";
import { BranchManageUsersPanel } from "./branch-manage-users-panel";
import { BranchManageOverviewPanel } from "./branch-manage-overview-panel";
import type { BranchManageTabKey } from "./branch-manage-overview-panel";

interface Props {
  branch: Branch;
  summary: BranchSummaryCounts | null;
  summaryLoading?: boolean;
  onSummaryRefresh: () => Promise<void>;
  onTabChange?: (tab: TabKey) => void;
}

type TabKey = BranchManageTabKey;

export function BranchManageWorkspace({
  branch,
  summary,
  summaryLoading = false,
  onSummaryRefresh,
  onTabChange,
}: Props) {
  const branchId = branch.id;
  const isArchived = Boolean(branch.deletedAt);
  const assignmentsDisabled = isArchived || branch.status !== "ACTIVE";

  const [tab, setTab] = useState<TabKey>("overview");
  const [search, setSearch] = useState("");

  const [instructors, setInstructors] = useState<TrainerListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>(
    [],
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const loadInstructors = useCallback(async () => {
    if (tab !== "instructors") {
      return;
    }

    setListLoading(true);
    try {
      const response = await trainerService.getTrainers({
        search,
        branchId,
        page: 1,
        pageSize: 100,
      });
      setInstructors(response.data.items ?? []);
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setInstructors([]);
    } finally {
      setListLoading(false);
    }
  }, [branchId, search, tab]);

  useEffect(() => {
    void loadInstructors();
  }, [loadInstructors]);

  const openAssignInstructors = async () => {
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const response = await trainerService.getTrainers({
        page: 1,
        pageSize: 200,
      });
      const assigned = new Set(instructors.map((item) => item.id));
      setAssignCandidates(
        (response.data.items ?? [])
          .filter(
            (item) =>
              !assigned.has(item.id) &&
              (item.branchId == null || item.branchId === ""),
          )
          .map((item) => ({
            id: item.id,
            label: formatPersonName(item.firstName, item.lastName),
            meta: item.email ?? item.status,
          })),
      );
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssignInstructors = async (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    setAssignSubmitting(true);
    try {
      for (const id of ids) {
        await trainerService.updateTrainer(id, { branchId });
      }
      appToast.success("Instructors assigned");
      setAssignOpen(false);
      await loadInstructors();
      await onSummaryRefresh();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUnassignInstructor = async () => {
    if (!unassignTarget) {
      return;
    }

    setUnassignLoading(true);
    try {
      await trainerService.updateTrainer(unassignTarget.id, {
        branchId: null,
      });
      appToast.success("Instructor unassigned");
      setUnassignTarget(null);
      await loadInstructors();
      await onSummaryRefresh();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setUnassignLoading(false);
    }
  };

  return (
    <>
      <Tabs
        value={tab}
        onValueChange={(value) => {
          setSearch("");
          const nextTab = value as TabKey;
          setTab(nextTab);
          onTabChange?.(nextTab);
        }}
      >
        <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          {(
            [
              ["overview", "Overview"],
              ["users", "Users"],
              ["categories", "Categories"],
              ["courses", "Courses"],
              ["batches", "Batches"],
              ["students", "Students"],
              ["enrollments", "Enrollments"],
              ["instructors", "Instructors"],
              ["reports", "Reports"],
            ] as const
          ).map(([value, label]) => (
            <TabsTrigger
              key={value}
              value={value}
              className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2447A8] data-[state=active]:bg-transparent data-[state=active]:text-[#2447A8] data-[state=active]:shadow-none"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-3">
          <BranchManageOverviewPanel
            branchId={branchId}
            summary={summary}
            summaryLoading={summaryLoading}
            assignmentsDisabled={assignmentsDisabled}
            onSummaryRefresh={onSummaryRefresh}
            onNavigateToTab={(nextTab) => {
              setTab(nextTab);
              onTabChange?.(nextTab);
            }}
          />
        </TabsContent>

        <TabsContent value="users" className="space-y-3">
          <BranchManageUsersPanel
            branchId={branchId}
            branchName={branch.branchName}
            branchCode={branch.branchCode}
            disabled={assignmentsDisabled}
          />
        </TabsContent>

        <TabsContent value="categories">
          <BranchManageCategoriesPanel
            branchId={branchId}
            assignmentsDisabled={assignmentsDisabled}
            onSummaryRefresh={onSummaryRefresh}
          />
        </TabsContent>

        <TabsContent value="courses">
          <BranchManageCoursesPanel
            branchId={branchId}
            assignmentsDisabled={assignmentsDisabled}
            onSummaryRefresh={onSummaryRefresh}
          />
        </TabsContent>

        <TabsContent value="batches">
          <BranchManageBatchesPanel branchId={branchId} />
        </TabsContent>

        <TabsContent value="students">
          <BranchManageStudentsPanel
            branchId={branchId}
            assignmentsDisabled={assignmentsDisabled}
            onSummaryRefresh={onSummaryRefresh}
          />
        </TabsContent>

        <TabsContent value="enrollments">
          <BranchManageEnrollmentsPanel branchId={branchId} />
        </TabsContent>

        <TabsContent value="instructors">
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1 sm:max-w-sm">
                <SearchInput
                  value={search}
                  placeholder="Search instructors..."
                  onChange={setSearch}
                />
              </div>
              <Button
                type="button"
                size="sm"
                disabled={assignmentsDisabled}
                onClick={() => {
                  void openAssignInstructors();
                }}
              >
                Assign Instructor
              </Button>
            </div>

            {listLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading instructors...
              </p>
            ) : instructors.length === 0 ? (
              <EmptyState
                title="No instructors assigned"
                description="No instructors have been assigned to this branch yet."
              />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Instructor</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {instructors.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-slate-900">
                          {formatPersonName(item.firstName, item.lastName)}
                        </TableCell>
                        <TableCell>{item.email ?? "—"}</TableCell>
                        <TableCell>{item.status ?? "—"}</TableCell>
                        <TableCell className="text-right">
                          <BranchIconAction
                            icon={Link2Off}
                            label="Unassign Instructor"
                            destructive
                            disabled={assignmentsDisabled}
                            onClick={() =>
                              setUnassignTarget({
                                id: item.id,
                                label: formatPersonName(
                                  item.firstName,
                                  item.lastName,
                                ),
                              })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="rounded-xl border border-slate-200 p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-700">
              Reports coming soon
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Branch-level reporting will be available in a future update.
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Instructors"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search instructors..."
        emptyMessage="No instructors available to assign"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssignInstructors}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign Instructor"
        description={`Remove "${unassignTarget?.label ?? "this instructor"}" from this branch?`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={handleUnassignInstructor}
      />
    </>
  );
}
