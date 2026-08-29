"use client";

import { useEffect, useMemo, useState } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  AttendanceDetailModal,
  useAttendanceDetailState,
} from "@/src/features/branch-ops/components/attendance/attendance-detail-modal";
import { TakeAttendanceModal } from "@/src/features/branch-ops/components/attendance/take-attendance-modal";
import type { AttendanceItem } from "@/src/features/branch-ops/types";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Input } from "@/src/shared/components/ui/input";
import { ListPageHeader } from "@/src/shared/components/ui/list-page-header";
import { Loader } from "@/src/shared/components/ui/loader";
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
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { formatRoleLabel } from "@/src/core/auth/roles";

const STATUS_OPTIONS = [
  { label: "All Status", value: "ALL" },
  { label: "Present", value: "PRESENT" },
  { label: "Absent", value: "ABSENT" },
  { label: "Late", value: "LATE" },
  { label: "Leave", value: "LEAVE" },
];

const PERIOD_OPTIONS = [
  { label: "Date range / custom", value: "CUSTOM" },
  { label: "Daily", value: "daily" },
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function monthStartValue(reference = new Date()) {
  return new Date(reference.getFullYear(), reference.getMonth(), 1)
    .toISOString()
    .slice(0, 10);
}

function formatDisplayDate(value: string) {
  const raw = value?.toString().slice(0, 10);
  const date = new Date(`${raw}T00:00:00`);
  if (Number.isNaN(date.getTime())) return raw;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusVariant(status: string) {
  if (status === "PRESENT") return "success" as const;
  if (status === "ABSENT") return "danger" as const;
  if (status === "LATE") return "warning" as const;
  return "default" as const;
}

export default function AttendancePage() {
  const role = useAuthStore((state) => state.user?.role);
  const [takeOpen, setTakeOpen] = useState(false);
  const detail = useAttendanceDetailState();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [period, setPeriod] = useState("CUSTOM");
  const [date, setDate] = useState(todayInputValue());
  const [from, setFrom] = useState(monthStartValue());
  const [to, setTo] = useState(todayInputValue());
  const [batchId, setBatchId] = useState("ALL");
  const [batchCourseId, setBatchCourseId] = useState("ALL");
  const [studentId, setStudentId] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);
  const studentsQuery = useAsyncData(() => branchOpsApi.students(), []);
  const sessionsQuery = useAsyncData(
    () =>
      batchId !== "ALL"
        ? branchOpsApi.batchSessions(batchId)
        : Promise.resolve([]),
    [batchId],
  );

  const reportParams = useMemo(() => {
    const params: Record<string, string | number | undefined> = {
      batchId: batchId === "ALL" ? undefined : batchId,
      batchCourseId: batchCourseId === "ALL" ? undefined : batchCourseId,
      studentId: studentId === "ALL" ? undefined : studentId,
      status: status === "ALL" ? undefined : status,
      search: debouncedSearch || undefined,
      skip: (page - 1) * pageSize,
      take: pageSize,
    };

    if (period === "CUSTOM") {
      params.from = from || undefined;
      params.to = to || undefined;
    } else {
      params.period = period;
      params.date = date || undefined;
    }

    return params;
  }, [
    batchId,
    batchCourseId,
    studentId,
    status,
    debouncedSearch,
    page,
    pageSize,
    period,
    from,
    to,
    date,
  ]);

  const reportQuery = useAsyncData(
    () => branchOpsApi.attendanceReport(reportParams),
    [
      reportParams.batchId,
      reportParams.batchCourseId,
      reportParams.studentId,
      reportParams.status,
      reportParams.search,
      reportParams.skip,
      reportParams.take,
      reportParams.period,
      reportParams.date,
      reportParams.from,
      reportParams.to,
    ],
  );

  const items = reportQuery.data?.items ?? [];
  const total = reportQuery.data?.total ?? 0;
  const totals = reportQuery.data?.totals;

  const openSessionDetail = (item: AttendanceItem) => {
    const day = String(item.date).slice(0, 10);
    const related = items.filter(
      (row) =>
        String(row.date).slice(0, 10) === day &&
        row.session.batchCourseId === item.session.batchCourseId &&
        row.batch.id === item.batch.id,
    );
    detail.openWith(
      related.length ? related : [item],
      `${formatDisplayDate(day)} · ${item.session.label}`,
    );
  };

  const openStudentHistory = async (item: AttendanceItem) => {
    try {
      const history = await branchOpsApi.attendanceReport({
        studentId: item.student.id,
        from,
        to,
        take: 200,
      });
      detail.openWith(
        history.items,
        `${item.student.name} · Attendance history`,
      );
    } catch {
      detail.openWith(
        items.filter((row) => row.student.id === item.student.id),
        `${item.student.name} · Attendance history`,
      );
    }
  };

  if (batchesQuery.loading) return <Loader />;
  if (batchesQuery.error) {
    return (
      <ErrorState
        description={batchesQuery.error}
        onRetry={batchesQuery.reload}
      />
    );
  }

  return (
    <div className="space-y-5">
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Attendance"
        title="Attendance"
        totalLabel="Records"
        total={total}
        action={
          <Button onClick={() => setTakeOpen(true)}>Take Attendance</Button>
        }
        filters={
          <>
            <div className="w-full sm:w-[240px]">
              <SearchInput
                value={search}
                placeholder="Search student name/code..."
                className="h-[46px] rounded-xl"
                onChange={setSearch}
              />
            </div>
            <div className="w-full sm:w-[170px]">
              <AppSelect
                value={period}
                triggerClassName="h-[46px] rounded-xl"
                onValueChange={(value) => {
                  setPeriod(value);
                  setPage(1);
                }}
                options={PERIOD_OPTIONS}
              />
            </div>
            {period === "CUSTOM" ? (
              <>
                <div className="w-full sm:w-[160px]">
                  <Input
                    type="date"
                    className="h-[46px] rounded-xl"
                    value={from}
                    onChange={(event) => {
                      setFrom(event.target.value);
                      setPage(1);
                    }}
                  />
                </div>
                <div className="w-full sm:w-[160px]">
                  <Input
                    type="date"
                    className="h-[46px] rounded-xl"
                    value={to}
                    onChange={(event) => {
                      setTo(event.target.value);
                      setPage(1);
                    }}
                  />
                </div>
              </>
            ) : (
              <div className="w-full sm:w-[160px]">
                <Input
                  type="date"
                  className="h-[46px] rounded-xl"
                  value={date}
                  onChange={(event) => {
                    setDate(event.target.value);
                    setPage(1);
                  }}
                />
              </div>
            )}
            <div className="w-full sm:w-[200px]">
              <AppSelect
                value={batchId}
                triggerClassName="h-[46px] rounded-xl"
                onValueChange={(value) => {
                  setBatchId(value);
                  setBatchCourseId("ALL");
                  setPage(1);
                }}
                options={[
                  { label: "All Batches", value: "ALL" },
                  ...(batchesQuery.data ?? []).map((batch) => ({
                    label: batch.name,
                    value: batch.id,
                  })),
                ]}
              />
            </div>
            <div className="w-full sm:w-[240px]">
              <AppSelect
                value={batchCourseId}
                triggerClassName="h-[46px] rounded-xl"
                onValueChange={(value) => {
                  setBatchCourseId(value);
                  setPage(1);
                }}
                options={[
                  { label: "All Sessions", value: "ALL" },
                  ...(sessionsQuery.data ?? []).map((session) => ({
                    label: session.label,
                    value: session.batchCourseId,
                  })),
                ]}
                disabled={batchId === "ALL"}
              />
            </div>
            <div className="w-full sm:w-[220px]">
              <AppSelect
                value={studentId}
                triggerClassName="h-[46px] rounded-xl"
                onValueChange={(value) => {
                  setStudentId(value);
                  setPage(1);
                }}
                options={[
                  { label: "All Students", value: "ALL" },
                  ...(studentsQuery.data ?? []).map((student) => ({
                    label: `${[student.firstName, student.lastName]
                      .filter(Boolean)
                      .join(" ")} (${student.studentCode})`,
                    value: student.id,
                  })),
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
                options={STATUS_OPTIONS}
              />
            </div>
          </>
        }
      />

      {totals ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="p-4 text-sm">
            Total {totals.total}
          </Card>
          <Card className="p-4 text-sm text-emerald-700">
            Present {totals.present}
          </Card>
          <Card className="p-4 text-sm text-rose-700">
            Absent {totals.absent}
          </Card>
          <Card className="p-4 text-sm text-amber-700">
            Late {totals.late}
          </Card>
          <Card className="p-4 text-sm">
            Attendance {totals.percentage}%
          </Card>
        </div>
      ) : null}

      {period === "monthly" || (period === "CUSTOM" && from && to) ? (
        reportQuery.data?.bySession?.length ? (
          <Card className="space-y-3 p-4">
            <p className="text-sm font-semibold text-[#102A56]">
              Session-level summary
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {reportQuery.data.bySession.map((session) => (
                <div
                  key={session.batchCourseId}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm"
                >
                  <p className="font-medium text-[#102A56]">{session.label}</p>
                  <p className="mt-1 text-slate-600">
                    Present {session.present} · Absent {session.absent} · Late{" "}
                    {session.late}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        ) : null
      ) : null}

      {reportQuery.loading ? (
        <Loader />
      ) : reportQuery.error ? (
        <ErrorState
          description={reportQuery.error}
          onRetry={reportQuery.reload}
        />
      ) : !items.length ? (
        <EmptyState title="No attendance records found." />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Batch</TableHead>
                <TableHead>Session</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDisplayDate(String(item.date))}</TableCell>
                  <TableCell>
                    <div>{item.student.name}</div>
                    <div className="font-mono text-xs text-slate-400">
                      {item.student.studentCode}
                    </div>
                  </TableCell>
                  <TableCell>{item.batch.name}</TableCell>
                  <TableCell>
                    {item.session.sessionNumber != null
                      ? `Session ${item.session.sessionNumber}`
                      : item.session.label}
                  </TableCell>
                  <TableCell>{item.course.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(item.status)}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openSessionDetail(item)}
                      >
                        Session
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void openStudentHistory(item)}
                      >
                        Student
                      </Button>
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
        </>
      )}

      <TakeAttendanceModal
        open={takeOpen}
        onClose={() => setTakeOpen(false)}
        onSaved={() => void reportQuery.reload()}
        batches={batchesQuery.data ?? []}
      />

      <AttendanceDetailModal
        open={detail.open}
        onClose={detail.close}
        title={detail.title}
        items={detail.items}
      />
    </div>
  );
}
