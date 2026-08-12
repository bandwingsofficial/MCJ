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
import { BranchStatusBadge } from "@/src/features/branches/components/branch-status-badge";
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

interface Props {
  branch: Branch;
  summary: BranchSummaryCounts | null;
  onSummaryRefresh: () => Promise<void>;
}

type TabKey =
  | "overview"
  | "categories"
  | "courses"
  | "batches"
  | "students"
  | "enrollments"
  | "instructors"
  | "reports";

function formatAddress(branch: Branch) {
  return [
    branch.addressLine1,
    branch.addressLine2,
    branch.city,
    branch.state,
    branch.country,
    branch.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
}

export function BranchManageWorkspace({
  branch,
  summary,
  onSummaryRefresh,
}: Props) {
  const branchId = branch.id;
  const isArchived = Boolean(branch.deletedAt);
  const assignmentsDisabled =
    isArchived || branch.status !== "ACTIVE";

  const [tab, setTab] = useState<TabKey>("overview");
  const [search, setSearch] = useState("");

  const [categories, setCategories] = useState<
    CategoryListItem[]
  >([]);
  const [courses, setCourses] = useState<CourseListItem[]>(
    []
  );
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [enrollments, setEnrollments] = useState<
    Enrollment[]
  >([]);
  const [instructors, setInstructors] = useState<
    TrainerListItem[]
  >([]);

  const [listLoading, setListLoading] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignKind, setAssignKind] = useState<
    "categories" | "courses" | "instructors" | null
  >(null);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<
    AssignableItem[]
  >([]);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] =
    useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    kind: "categories" | "courses" | "instructors";
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] =
    useState(false);

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
            (item) =>
              !item.isDeleted && item.status === "ACTIVE"
          )
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
        const response =
          await enrollmentService.getEnrollments({
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
          includeDeleted: false,
          skip: 0,
          take: 100,
        });
        setInstructors(response.data ?? []);
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

  const openAssign = async (
    kind: "categories" | "courses" | "instructors"
  ) => {
    setAssignKind(kind);
    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      if (kind === "categories") {
        const response = await categoryService.getCategories({
          search: "",
          status: "ACTIVE",
          branchId: undefined,
          page: 1,
          pageSize: 200,
        });
        const assignedIds = new Set(
          categories.map((item) => item.id)
        );
        setAssignCandidates(
          (response.data ?? [])
            .filter(
              (item) =>
                !item.isDeleted &&
                item.status === "ACTIVE" &&
                !assignedIds.has(item.id) &&
                (item.branchId == null ||
                  item.branchId === "")
            )
            .map((item) => ({
              id: item.id,
              label: item.name,
              meta: item.status,
              imageUrl: item.thumbnailUrl,
            }))
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
            }))
        );
      }

      if (kind === "instructors") {
        const response = await trainerService.getTrainers({
          search: "",
          includeDeleted: false,
          skip: 0,
          take: 200,
        });
        const assigned = new Set(
          instructors.map((item) => item.id)
        );
        setAssignCandidates(
          (response.data ?? [])
            .filter(
              (item) =>
                !assigned.has(item.id) &&
                (item.branchId == null ||
                  item.branchId === "")
            )
            .map((item) => ({
              id: item.id,
              label: [item.firstName, item.lastName]
                .filter(Boolean)
                .join(" "),
              meta: item.email ?? item.status,
            }))
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
        for (const id of ids) {
          await categoryService.updateCategory(id, {
            branchId,
          });
        }
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
          const next = Array.from(
            new Set([...existing, branchId])
          );
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
        await categoryService.updateCategory(
          unassignTarget.id,
          { branchId: null }
        );
      }

      if (unassignTarget.kind === "courses") {
        const detail = await courseService.getCourse(
          unassignTarget.id
        );
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
        await trainerService.updateTrainer(
          unassignTarget.id,
          { branchId: null }
        );
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
    createLabel?: string
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
            className="inline-flex h-10 items-center rounded-xl border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Plus className="mr-1.5 h-4 w-4" />
            {createLabel}
          </Link>
        ) : null}
        {kind ? (
          <Button
            type="button"
            disabled={assignmentsDisabled}
            onClick={() => {
              void openAssign(kind);
            }}
          >
            <Plus className="mr-1.5 h-4 w-4" />
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
          setTab(value as TabKey);
        }}
      >
        <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {(
            [
              ["overview", "Overview"],
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
              className="rounded-lg px-3 py-1.5 text-sm data-[state=active]:bg-[#2447A8] data-[state=active]:text-white"
            >
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Branch Information
            </h2>
            <dl className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-500">Name</dt>
                <dd className="text-[15px] font-medium text-slate-900">
                  {branch.branchName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Code</dt>
                <dd className="text-[15px] font-medium text-slate-900">
                  {branch.branchCode}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Status</dt>
                <dd className="mt-0.5">
                  <BranchStatusBadge
                    status={branch.status}
                    deletedAt={branch.deletedAt}
                  />
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Email</dt>
                <dd className="text-[15px] font-medium text-slate-900">
                  {branch.email || "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Phone</dt>
                <dd className="text-[15px] font-medium text-slate-900">
                  {branch.phone || "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-500">
                  Address
                </dt>
                <dd className="text-[15px] font-medium text-slate-900">
                  {formatAddress(branch) || "—"}
                </dd>
              </div>
            </dl>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            {sectionToolbar(
              "categories",
              "Assign Categories"
            )}
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
              <ul className="divide-y divide-slate-200">
                {categories.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
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
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-medium text-slate-900">
                          {item.name}
                        </p>
                        <p className="text-xs text-emerald-600">
                          Active
                        </p>
                      </div>
                    </div>
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
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            {sectionToolbar("courses", "Assign Course")}
            {listLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading courses...
              </p>
            ) : courses.length === 0 ? (
              <EmptyState
                title="No courses assigned"
                description="No courses have been assigned to this branch yet."
              />
            ) : (
              <ul className="divide-y divide-slate-200">
                {courses.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div>
                      <p className="text-[15px] font-medium text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.status}
                      </p>
                    </div>
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
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="batches">
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            {sectionToolbar(
              null,
              "",
              `/batches/create`,
              "Create Batch"
            )}
            {listLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading batches...
              </p>
            ) : batches.length === 0 ? (
              <EmptyState
                title="No batches"
                description="No batches belong to this branch yet."
              />
            ) : (
              <ul className="divide-y divide-slate-200">
                {batches.map((item) => (
                  <li key={item.id} className="py-2.5">
                    <p className="text-[15px] font-medium text-slate-900">
                      {item.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.course?.title ?? item.courseId} ·{" "}
                      {item.status} · enrolled{" "}
                      {item.enrolledCount}/{item.capacity}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="students">
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            {sectionToolbar(
              null,
              "",
              `/students/create`,
              "Add Student"
            )}
            {listLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading students...
              </p>
            ) : students.length === 0 ? (
              <EmptyState
                title="No students"
                description="No students belong to this branch yet."
              />
            ) : (
              <ul className="divide-y divide-slate-200">
                {students.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div>
                      <p className="text-[15px] font-medium text-slate-900">
                        {[item.firstName, item.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.email ?? "—"} · {item.status}
                      </p>
                    </div>
                    <Link
                      href={`/students/${item.id}`}
                      className="text-sm font-medium text-[#2447A8] hover:underline"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="enrollments">
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            {sectionToolbar(
              null,
              "",
              `/enrollments/create`,
              "Create Enrollment"
            )}
            {listLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading enrollments...
              </p>
            ) : enrollments.length === 0 ? (
              <EmptyState
                title="No enrollments"
                description="No enrollments for this branch yet."
              />
            ) : (
              <ul className="divide-y divide-slate-200">
                {enrollments.map((item) => (
                  <li key={item.id} className="py-2.5">
                    <p className="text-[15px] font-medium text-slate-900">
                      {item.enrollmentNumber}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.status} · {item.paymentStatus}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="instructors">
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            {sectionToolbar(
              "instructors",
              "Assign Instructor"
            )}
            {listLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading instructors...
              </p>
            ) : instructors.length === 0 ? (
              <EmptyState
                title="No instructors"
                description="No instructors have been assigned to this branch yet."
              />
            ) : (
              <ul className="divide-y divide-slate-200">
                {instructors.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 py-2.5"
                  >
                    <div>
                      <p className="text-[15px] font-medium text-slate-900">
                        {[item.firstName, item.lastName]
                          .filter(Boolean)
                          .join(" ")}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.email ?? "—"} · {item.status}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={assignmentsDisabled}
                      onClick={() =>
                        setUnassignTarget({
                          kind: "instructors",
                          id: item.id,
                          label: [
                            item.firstName,
                            item.lastName,
                          ]
                            .filter(Boolean)
                            .join(" "),
                        })
                      }
                    >
                      Unassign
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Branch Reports
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Counts below are live aggregates from existing
              branch-linked records. Trend charts are not
              shown because dedicated analytics endpoints are
              not available yet.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
              {(
                [
                  ["Students", summary?.students],
                  ["Courses", summary?.courses],
                  ["Batches", summary?.batches],
                  ["Enrollments", summary?.enrollments],
                  ["Instructors", summary?.instructors],
                  ["Categories", summary?.categories],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-3"
                >
                  <p className="text-xs text-slate-500">
                    {label}
                  </p>
                  <p className="text-xl font-bold text-slate-900">
                    {value ?? 0}
                  </p>
                </div>
              ))}
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
