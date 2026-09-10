"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ChevronRight, FileText } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type {
  EnrollmentItem,
  StudentBatchAttendanceDetail,
  StudentDetail,
  StudentDocumentItem,
} from "@/src/features/branch-ops/types";
import {
  formatBatchDate,
  formatBatchLabel,
  formatBatchStatus,
  studentName,
} from "@/src/features/branch-ops/utils/batch-display";
import { formatCurrency } from "@/src/features/branch-ops/utils/format-currency";
import { getBatchModeSectionLabel } from "@/src/features/branch-ops/utils/batch-mode.utils";
import {
  DEFAULT_PAGE_SIZE,
  MAX_LIST_TAKE,
  paginationParams,
} from "@/src/features/branch-ops/utils/pagination.utils";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { Avatar } from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
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
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const ACTIVE_ENROLLMENT_STATUSES = new Set(["ACTIVE", "ADMITTED"]);

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

function displayValue(value?: string | number | null) {
  if (value === undefined || value === null) return "—";
  if (typeof value === "string" && value.trim() === "") return "—";
  return String(value);
}

function formatGender(value?: string | null) {
  if (!value) return "—";
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatDocumentType(type: string) {
  return type
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
}

function formatAddress(student: StudentDetail) {
  const parts = [
    student.addressLine1,
    student.addressLine2,
    student.city,
    student.state,
    student.country,
    student.postalCode,
  ].filter((part) => Boolean(part?.trim()));

  return parts.length ? parts.join(", ") : "—";
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-[#647A9B]">{label}</dt>
      <dd className="mt-0.5 break-words text-sm font-medium text-[#102A56]">
        {value}
      </dd>
    </div>
  );
}

function OverviewSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-2xl border-[#E1EBF5] p-0 shadow-[0_2px_10px_rgba(16,42,86,0.04)]">
      <div className="border-b border-[#E1EBF5] px-5 py-3">
        <h2 className="text-sm font-semibold text-[#102A56]">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </Card>
  );
}

function StudentProfileHeader({
  student,
  enrollmentDate,
}: {
  student: StudentDetail;
  enrollmentDate: string | null;
}) {
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
                Enrollment Date:{" "}
                <span className="font-medium text-[#102A56]">
                  {formatBatchDate(enrollmentDate)}
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

  const enrollmentsQuery = useAsyncData(
    () =>
      branchOpsApi.enrollments({
        studentId,
        take: MAX_LIST_TAKE,
      }),
    [studentId],
  );

  const activeEnrollment = useMemo(() => {
    const enrollments = enrollmentsQuery.data?.items ?? [];
    return findActiveEnrollment(enrollments);
  }, [enrollmentsQuery.data?.items]);

  if (studentQuery.loading || (enrollmentsQuery.loading && !enrollmentsQuery.data)) {
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

      <StudentProfileHeader
        student={student}
        enrollmentDate={activeEnrollment?.enrollmentDate ?? null}
      />

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
          <TabsTrigger value="reports" className={TAB_CLASS}>
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {tab === "overview" ? (
            <StudentOverviewTab
              student={student}
              studentId={studentId}
              activeEnrollmentId={activeEnrollment?.id}
            />
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
            <StudentPlaceholderTab
              title="Assessment records"
              description="Assessment history for this student will appear here."
            />
          ) : null}
        </TabsContent>

        <TabsContent value="reports">
          {tab === "reports" ? (
            <StudentPlaceholderTab
              title="Student reports"
              description="Reports for this student will appear here."
            />
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StudentPlaceholderTab({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="rounded-2xl border border-[#E1EBF5] bg-white p-6">
      <h2 className="text-sm font-semibold text-[#102A56]">{title}</h2>
      <p className="mt-1 text-sm text-[#647A9B]">{description}</p>
      <div className="mt-4">
        <EmptyState title="No records available yet." />
      </div>
    </Card>
  );
}

function StudentDocumentsSection({
  documents,
}: {
  documents: StudentDocumentItem[];
}) {
  if (!documents.length) return null;

  return (
    <OverviewSection title="Documents">
      <ul className="divide-y divide-[#E8F0F8] rounded-xl border border-[#E8F0F8]">
        {documents.map((document) => (
          <li
            key={document.id}
            className="flex flex-wrap items-start justify-between gap-3 px-4 py-3"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 shrink-0 text-[#2563EB]" />
                <p className="text-sm font-medium text-[#102A56]">
                  {document.name}
                </p>
              </div>
              <p className="mt-1 text-xs text-[#647A9B]">
                {formatDocumentType(document.type)}
                {document.description ? ` · ${document.description}` : ""}
              </p>
            </div>
            {document.fileUrl ? (
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-[#2563EB] hover:underline"
              >
                View
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </OverviewSection>
  );
}

function StudentOverviewTab({
  student,
  studentId,
  activeEnrollmentId,
}: {
  student: StudentDetail;
  studentId: string;
  activeEnrollmentId?: string;
}) {
  const enrollmentsQuery = useAsyncData(
    () =>
      branchOpsApi.enrollments({
        studentId,
        take: MAX_LIST_TAKE,
      }),
    [studentId],
  );

  const feesQuery = useAsyncData(
    () =>
      branchOpsApi.studentFees(studentId, {
        ...(activeEnrollmentId ? { enrollmentId: activeEnrollmentId } : {}),
        ...paginationParams(1, 1),
      }),
    [studentId, activeEnrollmentId],
  );

  const enrolledCourses = useMemo(() => {
    const titles = (enrollmentsQuery.data?.items ?? [])
      .map((item) => item.course?.title)
      .filter(Boolean) as string[];

    return [...new Set(titles)];
  }, [enrollmentsQuery.data?.items]);

  const loading = enrollmentsQuery.loading || feesQuery.loading;

  if (loading) {
    return <Loader />;
  }

  const feeSummary = feesQuery.data?.summary;

  return (
    <div className="space-y-4">
      <OverviewSection title="Student Details">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <DetailField label="Student Code" value={student.studentCode} />
          <DetailField
            label="Full Name"
            value={studentName(student)}
          />
          <DetailField label="Email" value={displayValue(student.email)} />
          <DetailField label="Phone" value={displayValue(student.phone)} />
          <DetailField
            label="Date of Birth"
            value={formatBatchDate(student.dateOfBirth)}
          />
          <DetailField
            label="Gender"
            value={formatGender(student.gender)}
          />
          <DetailField
            label="Parent/Guardian Name"
            value={displayValue(student.parentName)}
          />
          <DetailField
            label="Parent/Guardian Phone"
            value={displayValue(student.parentPhone)}
          />
          <DetailField
            label="Branch"
            value={student.branch?.branchName ?? "—"}
          />
          <DetailField
            label="Status"
            value={formatBatchStatus(student.status)}
          />
          <DetailField
            label="Opted/Enrolled Course(s)"
            value={
              enrolledCourses.length ? enrolledCourses.join(", ") : "—"
            }
          />
          <DetailField label="Qualification" value={displayValue(student.qualification)} />
          <DetailField label="College" value={displayValue(student.collegeName)} />
          <DetailField
            label="Specialization"
            value={displayValue(student.specialization)}
          />
          <DetailField
            label="Passing Year"
            value={displayValue(student.passingYear)}
          />
          <DetailField label="Address" value={formatAddress(student)} />
          <DetailField
            label="Emergency Contact Name"
            value={displayValue(student.emergencyContactName)}
          />
          <DetailField
            label="Emergency Contact Phone"
            value={displayValue(student.emergencyContactPhone)}
          />
          <DetailField label="Notes" value={displayValue(student.notes)} />
        </dl>
      </OverviewSection>

      <StudentDocumentsSection documents={student.documents ?? []} />

      <OverviewSection title="Fee Structure">
        {feesQuery.error ? (
          <p className="text-sm text-[#647A9B]">
            Unable to load fee summary for the current enrollment.
          </p>
        ) : !feeSummary ? (
          <p className="text-sm text-[#647A9B]">
            No fee summary is available for the current enrollment.
          </p>
        ) : (
          <div className="flex flex-wrap items-start gap-x-8 gap-y-3">
            <div className="min-w-[120px]">
              <p className="text-xs text-[#647A9B]">Course Fee</p>
              <p className="mt-0.5 text-sm font-semibold text-[#102A56]">
                {formatCurrency(feeSummary.totalCourseFee)}
              </p>
            </div>
            <div className="min-w-[120px]">
              <p className="text-xs text-[#647A9B]">Amount Paid</p>
              <p className="mt-0.5 text-sm font-semibold text-[#102A56]">
                {formatCurrency(feeSummary.amountPaid)}
              </p>
            </div>
            <div className="min-w-[120px]">
              <p className="text-xs text-[#647A9B]">Remaining Amount</p>
              <p className="mt-0.5 text-sm font-semibold text-[#102A56]">
                {formatCurrency(feeSummary.balanceDue)}
              </p>
            </div>
            <div className="min-w-[120px]">
              <p className="text-xs text-[#647A9B]">Payment Status</p>
              <p className="mt-0.5 text-sm font-semibold text-[#102A56]">
                {formatBatchStatus(feeSummary.paymentStatus)}
              </p>
            </div>
          </div>
        )}
      </OverviewSection>
    </div>
  );
}

function StudentAttendanceTab({ studentId }: { studentId: string }) {
  const [rows, setRows] = useState<
    Array<{ enrollment: EnrollmentItem; detail: StudentBatchAttendanceDetail }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    branchOpsApi
      .enrollments({ studentId, take: MAX_LIST_TAKE })
      .then(async (result) => {
        const enrollments = (result.items ?? []).filter(
          (item) => item.batch?.id,
        );
        const summaries = await Promise.all(
          enrollments.map(async (enrollment) => {
            const detail = await branchOpsApi.studentBatchAttendance(
              enrollment.batch!.id,
              studentId,
            );
            return { enrollment, detail };
          }),
        );
        if (!cancelled) setRows(summaries);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message =
          err && typeof err === "object" && "response" in err
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : null;
        setError(message ?? "Unable to load attendance summaries.");
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [studentId]);

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} />;
  if (!rows.length) {
    return <EmptyState title="No enrollment attendance found for this student." />;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E1EBF5] bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Batch</TableHead>
            <TableHead>Timing</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Enrollment Status</TableHead>
            <TableHead>Total Sessions</TableHead>
            <TableHead>Present</TableHead>
            <TableHead>Absent</TableHead>
            <TableHead>Late</TableHead>
            <TableHead>Attendance %</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(({ enrollment, detail }) => {
            const attendance = detail.summary.attendance;
            const batchId = enrollment.batch!.id;
            const timingLabel =
              detail.batchTiming?.name ??
              enrollment.batchTiming?.name ??
              "—";
            const modeLabel = detail.batchTiming?.mode
              ? getBatchModeSectionLabel(
                  detail.batchTiming.mode as "OFFLINE" | "ONLINE" | "RECORDED",
                )
              : enrollment.batchTiming?.mode
                ? getBatchModeSectionLabel(
                    enrollment.batchTiming.mode as
                      | "OFFLINE"
                      | "ONLINE"
                      | "RECORDED",
                  )
                : "—";

            return (
              <TableRow key={enrollment.id}>
                <TableCell className="min-w-[140px]">
                  {formatBatchLabel(detail.batch.name, detail.batch.code)}
                </TableCell>
                <TableCell>{timingLabel}</TableCell>
                <TableCell>{modeLabel}</TableCell>
                <TableCell>
                  <Badge variant="default">
                    {formatBatchStatus(detail.enrollmentStatus)}
                  </Badge>
                </TableCell>
                <TableCell>{attendance.totalSessions}</TableCell>
                <TableCell>{attendance.present}</TableCell>
                <TableCell>{attendance.absent}</TableCell>
                <TableCell>{attendance.late}</TableCell>
                <TableCell>
                  {attendance.percentage == null
                    ? "—"
                    : `${attendance.percentage.toFixed(2)}%`}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/attendance/details/${batchId}/${studentId}`}
                    className="text-sm font-medium text-[#2563EB] hover:underline"
                  >
                    View Details
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
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
