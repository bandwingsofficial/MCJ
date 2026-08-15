"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { SearchInput } from "@/src/shared/components/ui/search-input";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { Branch } from "@/src/features/branches/types/branch.types";
import type { BranchSummaryCounts } from "@/src/features/branches/hooks/use-branch-summary";
import { branchService } from "@/src/features/branches/services/branch.service";
import { categoryService } from "@/src/features/categories/services/category.service";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";
import { studentService } from "@/src/features/students/services/student.service";
import type { Student } from "@/src/features/students/types/student.types";
import { enrollmentService } from "@/src/features/enrollments/services/enrollment.service";
import type { Enrollment } from "@/src/features/enrollments/types";
import { trainerService } from "@/src/features/trainers/services/trainer.service";
import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "./assign-entities-modal";
import { BranchOverviewSummary } from "./branch-overview-summary";
import { BranchManageUsersPanel } from "./branch-manage-users-panel";

interface Props {
  branch: Branch;
  summary: BranchSummaryCounts | null;
  summaryLoading?: boolean;
  onSummaryRefresh: () => Promise<void>;
  onTabChange?: (tab: TabKey) => void;
}

type TabKey =
  | "overview"
  | "users"
  | "categories"
  | "courses"
  | "batches"
  | "students"
  | "enrollments"
  | "instructors"
  | "reports";

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

  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [instructors, setInstructors] = useState<TrainerListItem[]>([]);

  const [listLoading, setListLoading] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignKind, setAssignKind] = useState<
    "categories" | "courses" | "instructors" | null
  >(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>(
    [],
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    kind: "categories" | "courses" | "instructors";
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const loadTabData = useCallback(async () => {
    setListLoading(true);
    try {
      if (tab === "categories") {
        const response = await categoryService.getCategories({
          search,
          status: "ACTIVE",
          branchId,
          page: 1,
          pageSize: 100,
        });
        setCategories(
          (response.data ?? []).filter(
            (item) => !item.isDeleted && item.status === "ACTIVE",
          ),
        );
      }

      if (tab === "courses" || tab === "overview") {
        const response = await courseService.getCourses({
          search: tab === "courses" ? search : "",
          includeDeleted: false,
          branchId,
          skip: 0,
          take: 100,
        });
        setCourses(response.data ?? []);
      }

      if (tab === "batches") {
        const response = await batchService.getBatches({
          search,
          branchId,
          includeDeleted: false,
        });
        setBatches(response.data ?? []);
      }

      if (tab === "students") {
        const response = await studentService.getStudents({
          search,
          includeDeleted: false,
          branchId,
        });
        setStudents(response.data ?? []);
      }

      if (tab === "enrollments") {
        const response = await enrollmentService.getEnrollments({
          search,
          branchId,
          skip: 0,
          take: 100,
        });
        setEnrollments(response.data.items ?? []);
      }

      if (tab === "instructors") {
        const response = await trainerService.getTrainers({
          search,
          branchId,
          page: 1,
          pageSize: 100,
        });
        setInstructors(response.data.items ?? []);
      }
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setListLoading(false);
    }
  }, [branchId, search, tab]);

  useEffect(() => {
    void loadTabData();
  }, [loadTabData]);

  const openAssign = async (kind: "categories" | "courses" | "instructors") => {
    setAssignKind(kind);
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      if (kind === "categories") {
        const response = await categoryService.getCategories({
          search: "",
          status: "ACTIVE",
          page: 1,
          pageSize: 200,
        });
        const assignedIds = new Set(categories.map((item) => item.id));
        setAssignCandidates(
          (response.data ?? [])
            .filter(
              (item) =>
                !item.isDeleted &&
                item.status === "ACTIVE" &&
                !assignedIds.has(item.id),
            )
            .map((item) => ({
              id: item.id,
              label: item.name,
              meta: item.status,
              imageUrl: item.thumbnailUrl,
            })),
        );
      }

      if (kind === "courses") {
        const response = await courseService.getCourses({
          search: "",
          includeDeleted: false,
          skip: 0,
          take: 200,
        });
        const assigned = new Set(courses.map((c) => c.id));
        setAssignCandidates(
          (response.data ?? [])
            .filter((item) => !assigned.has(item.id))
            .map((item) => ({
              id: item.id,
              label: item.title,
              meta: item.status,
            })),
        );
      }

      if (kind === "instructors") {
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
              label: [item.firstName, item.lastName].filter(Boolean).join(" "),
              meta: item.email ?? item.status,
            })),
        );
      }
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAssignLoading(false);
    }
  };

  const handleAssign = async (ids: string[]) => {
    if (!assignKind || ids.length === 0) {
      return;
    }

    setAssignSubmitting(true);
    try {
      if (assignKind === "categories") {
        await branchService.assignCategories(branchId, ids);
        appToast.success("Categories assigned");
      }

      if (assignKind === "courses") {
        for (const id of ids) {
          const detail = await courseService.getCourse(id);
          const existing =
            (
              detail.data as {
                branches?: { id: string }[];
              }
            ).branches?.map((b) => b.id) ?? [];
          const next = Array.from(new Set([...existing, branchId]));
          await courseService.updateCourse(id, {
            branchIds: next,
          });
        }
        appToast.success("Courses assigned");
      }

      if (assignKind === "instructors") {
        for (const id of ids) {
          await trainerService.updateTrainer(id, {
            branchId,
          });
        }
        appToast.success("Instructors assigned");
      }

      setAssignOpen(false);
      setAssignKind(null);
      await loadTabData();
      await onSummaryRefresh();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!unassignTarget) {
      return;
    }

    setUnassignLoading(true);
    try {
      if (unassignTarget.kind === "categories") {
        await branchService.unassignCategory(branchId, unassignTarget.id);
      }

      if (unassignTarget.kind === "courses") {
        const detail = await courseService.getCourse(unassignTarget.id);
        const existing =
          (
            detail.data as {
              branches?: { id: string }[];
            }
          ).branches?.map((b) => b.id) ?? [];
        await courseService.updateCourse(unassignTarget.id, {
          branchIds: existing.filter((id) => id !== branchId),
        });
      }

      if (unassignTarget.kind === "instructors") {
        await trainerService.updateTrainer(unassignTarget.id, {
          branchId: null,
        });
      }

      appToast.success("Assignment removed");
      setUnassignTarget(null);
      await loadTabData();
      await onSummaryRefresh();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setUnassignLoading(false);
    }
  };

  const sectionToolbar = (
    kind: "categories" | "courses" | "instructors" | null,
    assignLabel: string,
    createHref?: string,
    createLabel?: string,
  ) => (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 sm:max-w-sm">
        <SearchInput
          value={search}
          placeholder="Search..."
          onChange={setSearch}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {createHref && createLabel ? (
          <Link
            href={createHref}
            className="inline-flex h-9 items-center rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {createLabel}
          </Link>
        ) : null}
        {kind ? (
          <Button
            type="button"
            size="sm"
            disabled={assignmentsDisabled}
            onClick={() => {
              void openAssign(kind);
            }}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            {assignLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );

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
          <BranchOverviewSummary summary={summary} isLoading={summaryLoading} />

          <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Additional Details
            </h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Description</dt>
                <dd className="mt-0.5 text-sm text-slate-800">
                  {branch.description?.trim() || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="mt-0.5 break-all text-sm font-medium text-slate-900">
                  {branch.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {branch.phone || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">Address</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {[
                    branch.addressLine1,
                    branch.addressLine2,
                    [branch.city, branch.state].filter(Boolean).join(", "),
                    branch.postalCode,
                    branch.country,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Country</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {branch.country || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Postal Code</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {branch.postalCode || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Latitude</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {branch.latitude ?? "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Longitude</dt>
                <dd className="mt-0.5 text-sm font-medium text-slate-900">
                  {branch.longitude ?? "—"}
                </dd>
              </div>
            </dl>
          </Card>
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
  <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
    {sectionToolbar("categories", "Assign Categories")}

    {listLoading ? (
      <p className="py-8 text-center text-sm text-slate-500">
        Loading categories...
      </p>
    ) : categories.length === 0 ? (
      <EmptyState
        title="No categories assigned"
        description="No categories have been assigned to this branch yet."
      />
    ) : (
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Image
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {categories.map((item) => (
              <tr
                key={item.id}
                className="transition-colors hover:bg-slate-50"
              >
                {/* Image */}
                <td className="px-4 py-3">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                    {item.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnailUrl}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] font-medium text-slate-400">
                        IMG
                      </span>
                    )}
                  </div>
                </td>

                {/* Name */}
                <td className="px-4 py-3">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {item.name}
                  </p>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Active
                  </span>
                </td>

                {/* Action */}
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={assignmentsDisabled}
                    onClick={() =>
                      setUnassignTarget({
                        kind: "categories",
                        id: item.id,
                        label: item.name,
                      })
                    }
                  >
                    Unassign
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </Card>
</TabsContent>

      <TabsContent value="courses" className="w-full min-w-0">
  <Card className="w-full min-w-0 rounded-xl border border-slate-200 p-4 shadow-sm">
    {sectionToolbar("courses", "Assign Course")}

    {listLoading ? (
      <p className="py-6 text-center text-sm text-slate-500">
        Loading courses...
      </p>
    ) : (
      <div className="w-full min-w-0 rounded-xl border border-slate-200">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[55%]" />
            <col className="w-[20%]" />
            <col className="w-[25%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Course
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {courses.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-5 text-center"
                >
                  <p className="text-sm font-medium text-slate-700">
                    No courses assigned yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Assign a course to this branch to see it here.
                  </p>
                </td>
              </tr>
            ) : (
              courses.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="min-w-0 overflow-hidden px-4 py-3">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.title}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={assignmentsDisabled}
                      onClick={() =>
                        setUnassignTarget({
                          kind: "courses",
                          id: item.id,
                          label: item.title,
                        })
                      }
                    >
                      Unassign
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </Card>
</TabsContent>

        <TabsContent value="batches" className="w-full min-w-0">
  <Card className="w-full min-w-0 rounded-xl border border-slate-200 p-4 shadow-sm">
    {sectionToolbar(null, "", `/batches/create`, "Create Batch")}

    {listLoading ? (
      <p className="py-6 text-center text-sm text-slate-500">
        Loading batches...
      </p>
    ) : (
      <div className="w-full min-w-0 rounded-xl border border-slate-200">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[25%]" />
            <col className="w-[15%]" />
            <col className="w-[20%]" />
            <col className="w-[10%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Batch
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Course
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Enrollment
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {batches.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-5 text-center"
                >
                  <p className="text-sm font-medium text-slate-700">
                    No batches assigned yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    No batches belong to this branch yet.
                  </p>
                </td>
              </tr>
            ) : (
              batches.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  {/* Batch */}
                  <td className="min-w-0 overflow-hidden px-4 py-3">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.name}
                    </p>
                  </td>

                  {/* Course */}
                  <td className="min-w-0 overflow-hidden px-4 py-3">
                    <p className="truncate text-sm text-slate-700">
                      {item.course?.title ?? item.courseId}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {item.status}
                    </span>
                  </td>

                  {/* Enrollment */}
                  <td className="px-4 py-3">
                    <span className="text-sm text-slate-700">
                      {item.enrolledCount}/{item.capacity}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="px-4 py-3 text-right">
                    <a
                      href={`/batches/${item.id}`}
                      className="text-sm font-medium text-blue-700 hover:text-blue-800"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </Card>
</TabsContent>

        <TabsContent value="students" className="w-full min-w-0">
  <Card className="w-full min-w-0 rounded-xl border border-slate-200 p-4 shadow-sm">
    {sectionToolbar(null, "", `/students/create`, "Add Student")}

    {listLoading ? (
      <p className="py-6 text-center text-sm text-slate-500">
        Loading students...
      </p>
    ) : (
      <div className="w-full min-w-0 rounded-xl border border-slate-200">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[35%]" />
            <col className="w-[35%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Student
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-5 text-center"
                >
                  <p className="text-sm font-medium text-slate-700">
                    No students assigned yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    No students belong to this branch yet.
                  </p>
                </td>
              </tr>
            ) : (
              students.map((item) => {
                const studentName = [
                  item.firstName,
                  item.lastName,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    {/* Student */}
                    <td className="min-w-0 overflow-hidden px-4 py-3">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {studentName || "—"}
                      </p>
                    </td>

                    {/* Email */}
                    <td className="min-w-0 overflow-hidden px-4 py-3">
                      <p className="truncate text-sm text-slate-700">
                        {item.email ?? "—"}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {item.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/students/${item.id}`}
                        className="text-sm font-medium text-[#2447A8] hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    )}
  </Card>
</TabsContent>

       <TabsContent value="enrollments" className="w-full min-w-0">
  <Card className="w-full min-w-0 rounded-xl border border-slate-200 p-4 shadow-sm">
    {sectionToolbar(
      null,
      "",
      `/enrollments/create`,
      "Create Enrollment",
    )}

    {listLoading ? (
      <p className="py-6 text-center text-sm text-slate-500">
        Loading enrollments...
      </p>
    ) : (
      <div className="w-full min-w-0 rounded-xl border border-slate-200">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[45%]" />
            <col className="w-[25%]" />
            <col className="w-[30%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Enrollment
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {enrollments.length === 0 ? (
              <tr>
                <td
                  colSpan={3}
                  className="px-4 py-5 text-center"
                >
                  <p className="text-sm font-medium text-slate-700">
                    No enrollments assigned yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    No enrollments for this branch yet.
                  </p>
                </td>
              </tr>
            ) : (
              enrollments.map((item) => (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-slate-50"
                >
                  <td className="min-w-0 overflow-hidden px-4 py-3">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {item.enrollmentNumber}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {item.status}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {item.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    )}
  </Card>
</TabsContent>

       <TabsContent value="instructors" className="w-full min-w-0">
  <Card className="w-full min-w-0 rounded-xl border border-slate-200 p-4 shadow-sm">
    {sectionToolbar("instructors", "Assign Instructor")}

    {listLoading ? (
      <p className="py-6 text-center text-sm text-slate-500">
        Loading instructors...
      </p>
    ) : (
      <div className="w-full min-w-0 rounded-xl border border-slate-200">
        <table className="w-full table-fixed border-collapse">
          <colgroup>
            <col className="w-[35%]" />
            <col className="w-[35%]" />
            <col className="w-[15%]" />
            <col className="w-[15%]" />
          </colgroup>

          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Instructor
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </th>

              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {instructors.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-5 text-center"
                >
                  <p className="text-sm font-medium text-slate-700">
                    No instructors assigned yet
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    No instructors have been assigned to this branch yet.
                  </p>
                </td>
              </tr>
            ) : (
              instructors.map((item) => {
                const instructorName = [
                  item.firstName,
                  item.lastName,
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-slate-50"
                  >
                    {/* Instructor */}
                    <td className="min-w-0 overflow-hidden px-4 py-3">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {instructorName || "—"}
                      </p>
                    </td>

                    {/* Email */}
                    <td className="min-w-0 overflow-hidden px-4 py-3">
                      <p className="truncate text-sm text-slate-700">
                        {item.email ?? "—"}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {item.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={assignmentsDisabled}
                        onClick={() =>
                          setUnassignTarget({
                            kind: "instructors",
                            id: item.id,
                            label: instructorName,
                          })
                        }
                      >
                        Unassign
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    )}
  </Card>
</TabsContent>

       <TabsContent value="reports" className="w-full min-w-0">
  <Card className="w-full min-w-0 rounded-xl border border-slate-200 p-4 shadow-sm">
    <div className="flex items-center justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">
          Branch Reports
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          Dedicated analytics and trend reports are not available yet.
        </p>
      </div>
    </div>

    <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/50 px-4 py-5 text-center">
      <p className="text-sm font-medium text-slate-700">
        Reports coming soon
      </p>

      <p className="mt-1 text-xs text-slate-500">
        Use the Overview tab to view the current branch summary and counts.
      </p>
    </div>
  </Card>
</TabsContent>
      </Tabs>

      <AssignEntitiesModal
        open={assignOpen}
        title={
          assignKind === "categories"
            ? "Assign Categories"
            : assignKind === "courses"
              ? "Assign Courses"
              : "Assign Instructors"
        }
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder={
          assignKind === "categories" ? "Search categories..." : "Search..."
        }
        emptyMessage={
          assignKind === "categories"
            ? "No active unassigned categories available"
            : "No matching records"
        }
        onClose={() => {
          setAssignOpen(false);
          setAssignKind(null);
        }}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Remove assignment?"
        description={
          unassignTarget
            ? `This will unassign “${unassignTarget.label}” from this branch. The record itself will not be deleted.`
            : ""
        }
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={() => {
          void handleUnassign();
        }}
      />
    </>
  );
}
