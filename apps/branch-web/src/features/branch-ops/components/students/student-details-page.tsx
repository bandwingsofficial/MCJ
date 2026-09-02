"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  AssessmentItem,
  AttendanceItem,
  EnrollmentItem,
  StudentDetail,
} from "@/src/features/branch-ops/types";
import {
  type AttendanceDatePreset,
  attendanceStatusVariant,
  formatAttendanceDisplayDate,
  resolveAttendanceDateRange,
} from "@/src/features/branch-ops/utils/attendance-date.utils";
import {
  formatBatchDate,
  formatBatchLabel,
  formatBatchStatus,
  studentName,
} from "@/src/features/branch-ops/utils/batch-display";
import {
  DEFAULT_PAGE_SIZE,
  MAX_LIST_TAKE,
  paginationParams,
} from "@/src/features/branch-ops/utils/pagination.utils";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Input } from "@/src/shared/components/ui/input";
import { Loader } from "@/src/shared/components/ui/loader";
import { AppSelect } from "@/src/shared/components/ui/select";
import { TablePaginationBar } from "@/src/shared/components/ui/table-pagination";
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
import { StudentFeesTab } from "@/src/features/branch-ops/components/students/student-fees-tab";
import { formatCurrency } from "@/src/features/branch-ops/utils/format-currency";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const ACTIVE_ENROLLMENT_STATUSES = new Set(["ACTIVE", "ADMITTED"]);

const DATE_PRESET_OPTIONS: Array<{
  label: string;
  value: AttendanceDatePreset;
}> = [
  { label: "All Time", value: "ALL_TIME" },
  { label: "Today", value: "TODAY" },
  { label: "Yesterday", value: "YESTERDAY" },
  { label: "This Week", value: "THIS_WEEK" },
  { label: "This Month", value: "THIS_MONTH" },
  { label: "Custom", value: "CUSTOM" },
];

const ATTENDANCE_STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Late", value: "LATE" },
  { label: "Leave", value: "LEAVE" },
];

const ASSESSMENT_TYPE_OPTIONS = [
  { label: "All Types", value: "ALL" },
  { label: "Test", value: "TEST" },
  { label: "Presentation", value: "PRESENTATION" },
  { label: "Assignment", value: "ASSIGNMENT" },
  { label: "Practical", value: "PRACTICAL" },
  { label: "Other", value: "OTHER" },
];

function initials(student: Pick<StudentDetail, "firstName" | "lastName">) {
  const first = student.firstName?.charAt(0) ?? "";
  const last = student.lastName?.charAt(0) ?? "";
  return (first + last).toUpperCase() || "?";
}

function findActiveEnrollment(enrollments: EnrollmentItem[]) {
  return (
    enrollments.find((item) => ACTIVE_ENROLLMENT_STATUSES.has(item.status)) ??
    enrollments[0] ??
    null
  );
}

function SummaryMetric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold text-[#102A56]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-[#647A9B]">{hint}</p> : null}
    </div>
  );
}

function AttendanceSummaryPanel({
  present,
  absent,
  late,
  total,
  percentage,
}: {
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SummaryMetric label="Total Sessions" value={total} />
      <SummaryMetric label="Present" value={present} />
      <SummaryMetric label="Absent" value={absent} />
      <SummaryMetric label="Late" value={late} />
      <SummaryMetric label="Attendance" value={`${percentage}%`} />
    </div>
  );
}

function StudentProfileHeader({ student }: { student: StudentDetail }) {
  const name = studentName(student);

  return (
    <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex gap-4">
          <Avatar
            src={student.profileImageUrl ?? undefined}
            alt={name}
            fallback={initials(student)}
          />
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-[#102A56]">{name}</h2>
              <Badge variant="default">
                {formatBatchStatus(student.status)}
              </Badge>
            </div>
            <p className="font-mono text-sm font-medium text-[#2563EB]">
              {student.studentCode}
            </p>
            {student.email ? (
              <p className="text-sm text-[#647A9B]">{student.email}</p>
            ) : null}
            {student.phone ? (
              <p className="text-sm text-[#647A9B]">Phone: {student.phone}</p>
            ) : null}
            <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-sm text-[#647A9B]">
              <span>
                Branch:{" "}
                <span className="font-medium text-[#102A56]">
                  {student.branch?.branchName ?? "—"}
                </span>
              </span>
              <span>
                Admission Date:{" "}
                <span className="font-medium text-[#102A56]">
                  {formatBatchDate(student.admissionDate)}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface Props {
  studentId: string;
}

export function StudentDetailsPage({ studentId }: Props) {
  const role = useAuthStore((state) => state.user?.role);
  const [tab, setTab] = useState("overview");

  const studentQuery = useAsyncData(
    () => branchOpsApi.student(studentId),
    [studentId],
  );

  if (studentQuery.loading) {
    return <Loader />;
  }

  if (studentQuery.error || !studentQuery.data) {
    return (
      <ErrorState
        description={
          studentQuery.error ??
          "Student could not be loaded because the student record was not found."
        }
        onRetry={studentQuery.reload}
      />
    );
  }

  const student = studentQuery.data;

  return (
    <div className="space-y-5">
      <header>
        <nav
          aria-label="Breadcrumb"
          className="flex flex-wrap items-center gap-1.5 text-sm"
        >
          <Link
            href="/dashboard"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            {formatRoleLabel(role) || "Branch"}
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <Link
            href="/enrollments"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            Student Enrollments
          </Link>
          <ChevronRight className="h-4 w-4 text-slate-400" aria-hidden="true" />
          <span aria-current="page" className="font-medium text-[#102A56]">
            Student Details
          </span>
        </nav>
        <h1 className="mt-3 text-[30px] font-bold tracking-tight text-[#102A56]">
          Student Details
        </h1>
      </header>

      <StudentProfileHeader student={student} />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger value="overview" className={TAB_CLASS}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="enrollments" className={TAB_CLASS}>
            Enrollments
          </TabsTrigger>
          <TabsTrigger value="attendance" className={TAB_CLASS}>
            Attendance
          </TabsTrigger>
          <TabsTrigger value="assessments" className={TAB_CLASS}>
            Assessments
          </TabsTrigger>
          <TabsTrigger value="fees" className={TAB_CLASS}>
            Fees
          </TabsTrigger>
          <TabsTrigger value="certificates" className={TAB_CLASS}>
            Certificates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {tab === "overview" ? (
            <StudentOverviewTab studentId={studentId} />
          ) : null}
        </TabsContent>

        <TabsContent value="enrollments">
          {tab === "enrollments" ? (
            <StudentEnrollmentsTab student={student} studentId={studentId} />
          ) : null}
        </TabsContent>

        <TabsContent value="attendance">
          {tab === "attendance" ? (
            <StudentAttendanceTab studentId={studentId} />
          ) : null}
        </TabsContent>

        <TabsContent value="assessments">
          {tab === "assessments" ? (
            <StudentAssessmentsTab studentId={studentId} />
          ) : null}
        </TabsContent>

        <TabsContent value="fees">
          {tab === "fees" ? <StudentFeesTab studentId={studentId} /> : null}
        </TabsContent>

        <TabsContent value="certificates">
          {tab === "certificates" ? (
            <EmptyState title="No certificates available." />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StudentOverviewTab({ studentId }: { studentId: string }) {
  const enrollmentsQuery = useAsyncData(
    () =>
      branchOpsApi.enrollments({
        studentId,
        take: MAX_LIST_TAKE,
      }),
    [studentId],
  );

  /** take: 1 is valid; totals are computed from the full filtered dataset on the server. */
  const attendanceQuery = useAsyncData(
    () =>
      branchOpsApi.attendanceReport({
        studentId,
        take: 1,
      }),
    [studentId],
  );

  const assessmentsQuery = useAsyncData(
    () => branchOpsApi.assessmentReport({ studentId }),
    [studentId],
  );

  const feesQuery = useAsyncData(
    () =>
      branchOpsApi.studentFees(studentId, {
        ...paginationParams(1, 1),
      }),
    [studentId],
  );

  const loading =
    enrollmentsQuery.loading ||
    attendanceQuery.loading ||
    assessmentsQuery.loading ||
    feesQuery.loading;

  if (loading) {
    return <Loader />;
  }

  const enrollments = enrollmentsQuery.data?.items ?? [];
  const activeEnrollment = findActiveEnrollment(enrollments);
  const attendanceTotals = attendanceQuery.data?.totals;
  const assessmentItems = assessmentsQuery.data?.items ?? [];
  const assessmentTotal = assessmentsQuery.data?.total ?? 0;
  const assessmentAverage =
    assessmentItems.length > 0
      ? Math.round(
          (assessmentItems.reduce((sum, item) => sum + item.percentage, 0) /
            assessmentItems.length) *
            10,
        ) / 10
      : null;

  const feeSummary = feesQuery.data?.summary;

  return (
    <div className="space-y-4">
      {enrollmentsQuery.error ? (
        <ErrorState
          description={enrollmentsQuery.error}
          onRetry={enrollmentsQuery.reload}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <SummaryMetric
            label="Active Enrollment"
            value={activeEnrollment?.enrollmentNumber ?? "—"}
            hint={
              activeEnrollment
                ? formatBatchStatus(activeEnrollment.status)
                : "No active enrollment"
            }
          />
          <SummaryMetric
            label="Total Enrollments"
            value={enrollmentsQuery.data?.count ?? enrollments.length}
          />
          <SummaryMetric
            label="Current Batch"
            value={
              activeEnrollment?.batch
                ? formatBatchLabel(
                    activeEnrollment.batch.name,
                    activeEnrollment.batch.code,
                  )
                : "—"
            }
          />
          <SummaryMetric
            label="Current Course"
            value={activeEnrollment?.course?.title ?? "—"}
          />
        </div>
      )}

      {attendanceQuery.error ? (
        <ErrorState
          description={attendanceQuery.error}
          onRetry={attendanceQuery.reload}
        />
      ) : attendanceTotals && attendanceTotals.total > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-[#102A56]">
            Attendance Summary
          </p>
          <AttendanceSummaryPanel
            present={attendanceTotals.present}
            absent={attendanceTotals.absent}
            late={attendanceTotals.late}
            total={attendanceTotals.total}
            percentage={attendanceTotals.percentage}
          />
        </div>
      ) : (
        <EmptyState title="No attendance records found." />
      )}

      {assessmentsQuery.error ? (
        <ErrorState
          description={assessmentsQuery.error}
          onRetry={assessmentsQuery.reload}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          <SummaryMetric
            label="Total Assessments"
            value={assessmentTotal}
            hint={
              assessmentAverage != null
                ? `Average score: ${assessmentAverage}%`
                : "No assessments recorded"
            }
          />
          {feesQuery.error ? (
            <SummaryMetric
              label="Fee Records"
              value="—"
              hint="Unable to load fee summary."
            />
          ) : feeSummary ? (
            <>
              <SummaryMetric
                label="Course Fee"
                value={formatCurrency(feeSummary.totalCourseFee)}
                hint={`Paid: ${formatCurrency(feeSummary.amountPaid)}`}
              />
              <SummaryMetric
                label="Balance Due"
                value={formatCurrency(feeSummary.balanceDue)}
                hint={formatBatchStatus(feeSummary.paymentStatus)}
              />
            </>
          ) : (
            <SummaryMetric
              label="Fee Records"
              value="—"
              hint="No fee records available."
            />
          )}
          <SummaryMetric
            label="Certificates"
            value="—"
            hint="No certificates available."
          />
        </div>
      )}
    </div>
  );
}

function StudentEnrollmentsTab({
  student,
  studentId,
}: {
  student: StudentDetail;
  studentId: string;
}) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const query = useAsyncData(
    () =>
      branchOpsApi.enrollments({
        studentId,
        ...paginationParams(page, pageSize),
      }),
    [studentId, page, pageSize],
  );

  const items = query.data?.items ?? [];
  const total = query.data?.count ?? 0;

  if (query.loading && !query.data) return <Loader />;
  if (query.error) {
    return (
      <ErrorState description={query.error} onRetry={query.reload} />
    );
  }

  if (!items.length) {
    return <EmptyState title="No enrollments found." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Enrollment Number</TableHead>
            <TableHead>Batch</TableHead>
            <TableHead>Course</TableHead>
            <TableHead>Enrollment Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-[#102A56]">
                    {studentName(student)}
                  </p>
                  <p className="text-xs text-[#647A9B]">{student.studentCode}</p>
                </div>
              </TableCell>
              <TableCell>{item.enrollmentNumber}</TableCell>
              <TableCell className="min-w-[140px]">
                {item.batch
                  ? formatBatchLabel(item.batch.name, item.batch.code)
                  : "—"}
              </TableCell>
              <TableCell className="min-w-[120px]">
                {item.course?.title ?? "—"}
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {formatBatchDate(item.enrollmentDate)}
              </TableCell>
              <TableCell>
                <Badge variant="default">{formatBatchStatus(item.status)}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  {item.batch?.id ? (
                    <>
                      <Link
                        href={`/batches/${item.batch.id}`}
                        className="text-sm font-medium text-[#2563EB] hover:underline"
                      >
                        Batch
                      </Link>
                      <Link
                        href={`/attendance/details/${item.batch.id}/${studentId}`}
                        className="text-sm font-medium text-[#2563EB] hover:underline"
                      >
                        Attendance
                      </Link>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

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
  );
}

type AttendanceFilters = {
  batchId: string;
  batchCourseId: string;
  status: string;
  datePreset: AttendanceDatePreset;
  from: string;
  to: string;
};

function StudentAttendanceTab({ studentId }: { studentId: string }) {
  const [filters, setFilters] = useState<AttendanceFilters>({
    batchId: "ALL",
    batchCourseId: "ALL",
    status: "ALL",
    datePreset: "ALL_TIME",
    from: "",
    to: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);

  const enrollmentsQuery = useAsyncData(
    () =>
      branchOpsApi.enrollments({ studentId, take: MAX_LIST_TAKE }),
    [studentId],
  );

  const batchOptions = useMemo(() => {
    const enrolledBatchIds = new Set(
      (enrollmentsQuery.data?.items ?? [])
        .map((item) => item.batch?.id)
        .filter(Boolean) as string[],
    );
    const batches = (batchesQuery.data ?? []).filter((batch) =>
      enrolledBatchIds.has(batch.id),
    );
    return [
      { label: "All Batches", value: "ALL" },
      ...batches.map((batch) => ({
        label: formatBatchLabel(batch.name, batch.code),
        value: batch.id,
      })),
    ];
  }, [batchesQuery.data, enrollmentsQuery.data?.items]);

  const sessionsQuery = useAsyncData(
    () =>
      filters.batchId !== "ALL"
        ? branchOpsApi.batchSessions(filters.batchId)
        : Promise.resolve([]),
    [filters.batchId],
  );

  const sessionOptions = useMemo(
    () => [
      { label: "All Sessions", value: "ALL" },
      ...(sessionsQuery.data ?? []).map((session) => ({
        label: session.label,
        value: session.batchCourseId,
      })),
    ],
    [sessionsQuery.data],
  );

  const dateRange = useMemo(
    () =>
      resolveAttendanceDateRange(filters.datePreset, filters.from, filters.to),
    [filters.datePreset, filters.from, filters.to],
  );

  const reportParams = useMemo(
    () => ({
      studentId,
      batchId: filters.batchId === "ALL" ? undefined : filters.batchId,
      batchCourseId:
        filters.batchCourseId === "ALL" ? undefined : filters.batchCourseId,
      status: filters.status === "ALL" ? undefined : filters.status,
      from: dateRange.from,
      to: dateRange.to,
      ...paginationParams(page, pageSize),
    }),
    [
      studentId,
      filters.batchId,
      filters.batchCourseId,
      filters.status,
      dateRange.from,
      dateRange.to,
      page,
      pageSize,
    ],
  );

  const reportQuery = useAsyncData(
    () => branchOpsApi.attendanceReport(reportParams),
    [
      reportParams.studentId,
      reportParams.batchId,
      reportParams.batchCourseId,
      reportParams.status,
      reportParams.from,
      reportParams.to,
      reportParams.skip,
      reportParams.take,
    ],
  );

  const updateFilters = (patch: Partial<AttendanceFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      if (patch.batchId && patch.batchId !== prev.batchId) {
        next.batchCourseId = "ALL";
      }
      return next;
    });
    setPage(1);
  };

  const items = reportQuery.data?.items ?? [];
  const total = reportQuery.data?.total ?? 0;
  const totals = reportQuery.data?.totals;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
          Filters
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AppSelect
            value={filters.batchId}
            options={batchOptions}
            onValueChange={(value) => updateFilters({ batchId: value })}
          />
          <AppSelect
            value={filters.batchCourseId}
            options={sessionOptions}
            disabled={filters.batchId === "ALL"}
            onValueChange={(value) => updateFilters({ batchCourseId: value })}
          />
          <AppSelect
            value={filters.status}
            options={ATTENDANCE_STATUS_OPTIONS}
            onValueChange={(value) => updateFilters({ status: value })}
          />
          <AppSelect
            value={filters.datePreset}
            options={DATE_PRESET_OPTIONS.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            onValueChange={(value) =>
              updateFilters({ datePreset: value as AttendanceDatePreset })
            }
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input
            type="date"
            className="h-[46px] rounded-xl"
            value={
              filters.datePreset === "CUSTOM"
                ? filters.from
                : (dateRange.from ?? "")
            }
            disabled={filters.datePreset !== "CUSTOM"}
            onChange={(event) => updateFilters({ from: event.target.value })}
          />
          <Input
            type="date"
            className="h-[46px] rounded-xl"
            value={
              filters.datePreset === "CUSTOM"
                ? filters.to
                : (dateRange.to ?? "")
            }
            disabled={filters.datePreset !== "CUSTOM"}
            onChange={(event) => updateFilters({ to: event.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            className="h-[46px] rounded-xl"
            onClick={() => {
              setFilters({
                batchId: "ALL",
                batchCourseId: "ALL",
                status: "ALL",
                datePreset: "ALL_TIME",
                from: "",
                to: "",
              });
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {reportQuery.loading && !reportQuery.data ? (
        <Loader />
      ) : reportQuery.error ? (
        <ErrorState description={reportQuery.error} onRetry={reportQuery.reload} />
      ) : (
        <>
          {totals && totals.total > 0 ? (
            <AttendanceSummaryPanel
              present={totals.present}
              absent={totals.absent}
              late={totals.late}
              total={totals.total}
              percentage={totals.percentage}
            />
          ) : null}

          {!items.length ? (
            <EmptyState title="No attendance records found." />
          ) : (
            <div className="overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item: AttendanceItem) => (
                    <TableRow key={item.id}>
                      <TableCell className="whitespace-nowrap">
                        {formatAttendanceDisplayDate(String(item.date))}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        {formatBatchLabel(item.batch.name, item.batch.code)}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        {item.session?.label ?? "—"}
                      </TableCell>
                      <TableCell className="min-w-[120px]">
                        {item.course.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant={attendanceStatusVariant(item.status)}>
                          {formatBatchStatus(item.status)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

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
        </>
      )}
    </div>
  );
}

type AssessmentFilters = {
  batchId: string;
  batchCourseId: string;
  type: string;
  datePreset: AttendanceDatePreset;
  from: string;
  to: string;
};

function StudentAssessmentsTab({ studentId }: { studentId: string }) {
  const [filters, setFilters] = useState<AssessmentFilters>({
    batchId: "ALL",
    batchCourseId: "ALL",
    type: "ALL",
    datePreset: "ALL_TIME",
    from: "",
    to: "",
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);
  const enrollmentsQuery = useAsyncData(
    () =>
      branchOpsApi.enrollments({ studentId, take: MAX_LIST_TAKE }),
    [studentId],
  );

  const batchOptions = useMemo(() => {
    const enrolledBatchIds = new Set(
      (enrollmentsQuery.data?.items ?? [])
        .map((item) => item.batch?.id)
        .filter(Boolean) as string[],
    );
    const batches = (batchesQuery.data ?? []).filter((batch) =>
      enrolledBatchIds.has(batch.id),
    );
    return [
      { label: "All Batches", value: "ALL" },
      ...batches.map((batch) => ({
        label: formatBatchLabel(batch.name, batch.code),
        value: batch.id,
      })),
    ];
  }, [batchesQuery.data, enrollmentsQuery.data?.items]);

  const sessionsQuery = useAsyncData(
    () =>
      filters.batchId !== "ALL"
        ? branchOpsApi.batchSessions(filters.batchId)
        : Promise.resolve([]),
    [filters.batchId],
  );

  const sessionOptions = useMemo(
    () => [
      { label: "All Sessions", value: "ALL" },
      ...(sessionsQuery.data ?? []).map((session) => ({
        label: session.label,
        value: session.batchCourseId,
      })),
    ],
    [sessionsQuery.data],
  );

  const dateRange = useMemo(
    () =>
      resolveAttendanceDateRange(filters.datePreset, filters.from, filters.to),
    [filters.datePreset, filters.from, filters.to],
  );

  const reportParams = useMemo(
    () => ({
      studentId,
      batchId: filters.batchId === "ALL" ? undefined : filters.batchId,
      batchCourseId:
        filters.batchCourseId === "ALL" ? undefined : filters.batchCourseId,
      type: filters.type === "ALL" ? undefined : filters.type,
      from: dateRange.from,
      to: dateRange.to,
      ...paginationParams(page, pageSize),
    }),
    [
      studentId,
      filters.batchId,
      filters.batchCourseId,
      filters.type,
      dateRange.from,
      dateRange.to,
      page,
      pageSize,
    ],
  );

  const reportQuery = useAsyncData(
    () => branchOpsApi.assessmentReport(reportParams),
    [
      reportParams.studentId,
      reportParams.batchId,
      reportParams.batchCourseId,
      reportParams.type,
      reportParams.from,
      reportParams.to,
      reportParams.skip,
      reportParams.take,
    ],
  );

  const updateFilters = (patch: Partial<AssessmentFilters>) => {
    setFilters((prev) => {
      const next = { ...prev, ...patch };
      if (patch.batchId && patch.batchId !== prev.batchId) {
        next.batchCourseId = "ALL";
      }
      return next;
    });
    setPage(1);
  };

  const items = reportQuery.data?.items ?? [];
  const total = reportQuery.data?.total ?? 0;

  return (
    <div className="space-y-4">
      <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#647A9B]">
          Filters
        </p>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AppSelect
            value={filters.batchId}
            options={batchOptions}
            onValueChange={(value) => updateFilters({ batchId: value })}
          />
          <AppSelect
            value={filters.batchCourseId}
            options={sessionOptions}
            disabled={filters.batchId === "ALL"}
            onValueChange={(value) => updateFilters({ batchCourseId: value })}
          />
          <AppSelect
            value={filters.type}
            options={ASSESSMENT_TYPE_OPTIONS}
            onValueChange={(value) => updateFilters({ type: value })}
          />
          <AppSelect
            value={filters.datePreset}
            options={DATE_PRESET_OPTIONS.map((item) => ({
              label: item.label,
              value: item.value,
            }))}
            onValueChange={(value) =>
              updateFilters({ datePreset: value as AttendanceDatePreset })
            }
          />
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <Input
            type="date"
            className="h-[46px] rounded-xl"
            value={
              filters.datePreset === "CUSTOM"
                ? filters.from
                : (dateRange.from ?? "")
            }
            disabled={filters.datePreset !== "CUSTOM"}
            onChange={(event) => updateFilters({ from: event.target.value })}
          />
          <Input
            type="date"
            className="h-[46px] rounded-xl"
            value={
              filters.datePreset === "CUSTOM"
                ? filters.to
                : (dateRange.to ?? "")
            }
            disabled={filters.datePreset !== "CUSTOM"}
            onChange={(event) => updateFilters({ to: event.target.value })}
          />
          <Button
            type="button"
            variant="outline"
            className="h-[46px] rounded-xl"
            onClick={() => {
              setFilters({
                batchId: "ALL",
                batchCourseId: "ALL",
                type: "ALL",
                datePreset: "ALL_TIME",
                from: "",
                to: "",
              });
              setPage(1);
            }}
          >
            Clear Filters
          </Button>
        </div>
      </Card>

      {reportQuery.loading && !reportQuery.data ? (
        <Loader />
      ) : reportQuery.error ? (
        <ErrorState description={reportQuery.error} onRetry={reportQuery.reload} />
      ) : !items.length ? (
        <EmptyState title="No assessments found." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Total Marks</TableHead>
                <TableHead>Obtained Marks</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item: AssessmentItem) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatAttendanceDisplayDate(String(item.date))}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {formatBatchLabel(item.batch.name, item.batch.code)}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {item.session?.label ?? "—"}
                  </TableCell>
                  <TableCell className="min-w-[120px]">
                    {item.course?.title ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="default">{item.type}</Badge>
                  </TableCell>
                  <TableCell className="min-w-[140px] font-medium">
                    {item.name}
                  </TableCell>
                  <TableCell>{item.maxMarks}</TableCell>
                  <TableCell>{item.obtainedMarks}</TableCell>
                  <TableCell>{item.percentage}%</TableCell>
                  <TableCell>
                    <Badge variant="success">Graded</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

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
    </div>
  );
}
