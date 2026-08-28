"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { ListPageHeader } from "@/src/shared/components/ui/list-page-header";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Card } from "@/src/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { FormError } from "@/src/shared/components/ui/form-error";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { appToast } from "@/src/shared/lib/toast";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { cn } from "@/src/shared/lib/cn";

const STATUSES = ["PRESENT", "ABSENT", "LATE", "LEAVE"] as const;

const schema = z.object({
  batchId: z.string().min(1, "Batch is required"),
  date: z.string().min(1, "Date is required"),
});

type FormValues = z.infer<typeof schema>;

export default function AttendancePage() {
  const role = useAuthStore((state) => state.user?.role);
  const today = new Date().toISOString().slice(0, 10);
  const [period, setPeriod] = useState("daily");
  const [statusFilter, setStatusFilter] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { batchId: "", date: today },
  });

  const batchId = form.watch("batchId");
  const date = form.watch("date");

  const studentsQuery = useAsyncData(
    () =>
      batchId
        ? branchOpsApi.batch(batchId).then((batch) => batch.students ?? [])
        : Promise.resolve([]),
    [batchId],
  );

  const reportParams = useMemo(
    () => ({
      period,
      date,
      batchId: batchId || undefined,
      status: statusFilter || undefined,
    }),
    [period, date, batchId, statusFilter],
  );

  const reportQuery = useAsyncData(
    () => branchOpsApi.attendanceReport(reportParams),
    [reportParams.period, reportParams.date, reportParams.batchId, reportParams.status],
  );

  const statusByStudent = new Map(
    (reportQuery.data?.items ?? [])
      .filter((item) => item.date?.toString().slice(0, 10) === date)
      .map((item) => [item.student.id, item]),
  );

  const save = async (studentId: string, status: string) => {
    const valid = await form.trigger();
    if (!valid) return;

    try {
      setSavingId(studentId);
      await branchOpsApi.saveAttendance({
        batchId,
        studentId,
        date,
        status,
      });
      appToast.success("Attendance saved");
      await reportQuery.reload();
    } catch {
      appToast.error("Unable to save attendance");
    } finally {
      setSavingId(null);
    }
  };

  const punch = async (studentId: string, type: "IN" | "OUT") => {
    if (!batchId) return;
    try {
      setSavingId(studentId);
      await branchOpsApi.punch({ batchId, studentId, type, date });
      appToast.success(type === "IN" ? "Punched in" : "Punched out");
      await reportQuery.reload();
    } catch {
      appToast.error("Unable to record punch");
    } finally {
      setSavingId(null);
    }
  };

  if (batchesQuery.loading) return <Loader />;
  if (batchesQuery.error) {
    return <ErrorState description={batchesQuery.error} onRetry={batchesQuery.reload} />;
  }

  return (
    <div>
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Attendance"
        title="Attendance"
        totalLabel="Records"
        total={reportQuery.data?.items.length ?? 0}
      />

      <Card className="mb-6 grid gap-4 md:grid-cols-4">
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Batch
          </label>
          <AppSelect
            value={batchId}
            onValueChange={(value) => form.setValue("batchId", value, { shouldValidate: true })}
            options={(batchesQuery.data ?? []).map((batch) => ({
              label: batch.name,
              value: batch.id,
            }))}
            placeholder="Select batch"
          />
          <FormError message={form.formState.errors.batchId?.message} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Date
          </label>
          <Input type="date" {...form.register("date")} />
          <FormError message={form.formState.errors.date?.message} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Period
          </label>
          <AppSelect
            value={period}
            onValueChange={setPeriod}
            options={[
              { label: "Daily", value: "daily" },
              { label: "Weekly", value: "weekly" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" },
            ]}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
            Status
          </label>
          <AppSelect
            value={statusFilter || "ALL"}
            onValueChange={(value) => setStatusFilter(value === "ALL" ? "" : value)}
            options={[
              { label: "All", value: "ALL" },
              ...STATUSES.map((status) => ({ label: status, value: status })),
            ]}
          />
        </div>
      </Card>

      {reportQuery.data ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-4">
          <Card className="p-4 text-sm">Present {reportQuery.data.totals.present}</Card>
          <Card className="p-4 text-sm">Absent {reportQuery.data.totals.absent}</Card>
          <Card className="p-4 text-sm">Late {reportQuery.data.totals.late}</Card>
          <Card className="p-4 text-sm">Leave {reportQuery.data.totals.leave}</Card>
        </div>
      ) : null}

      {!batchId ? (
        <EmptyState title="Select a batch to record or view attendance." />
      ) : studentsQuery.loading ? (
        <Loader />
      ) : !studentsQuery.data?.length ? (
        <EmptyState title="No students enrolled in that batch." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Punch</TableHead>
              <TableHead>Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {studentsQuery.data.map((student) => {
              const current = statusByStudent.get(student.id);
              return (
                <TableRow key={student.id}>
                  <TableCell>
                    {[student.firstName, student.lastName].filter(Boolean).join(" ")}
                    <div className="text-xs text-slate-400">{student.studentCode}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {STATUSES.map((status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={savingId === student.id}
                          onClick={() => void save(student.id, status)}
                          className={cn(
                            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                            current?.status === status
                              ? "bg-indigo-600 text-white"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingId === student.id}
                        onClick={() => void punch(student.id, "IN")}
                      >
                        In
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={savingId === student.id}
                        onClick={() => void punch(student.id, "OUT")}
                      >
                        Out
                      </Button>
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {current?.punchIn ? `In ${new Date(current.punchIn).toLocaleTimeString()}` : "No punch in"}
                      {current?.punchOut
                        ? ` · Out ${new Date(current.punchOut).toLocaleTimeString()}`
                        : ""}
                    </div>
                  </TableCell>
                  <TableCell>
                    {current?.durationMinutes != null
                      ? `${current.durationMinutes} min`
                      : "—"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-700">Attendance records</h2>
      {reportQuery.loading ? (
        <Loader />
      ) : !reportQuery.data?.items.length ? (
        <EmptyState title="No attendance records found." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Faculty</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportQuery.data.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.date?.toString().slice(0, 10)}</TableCell>
                <TableCell>{item.student.name}</TableCell>
                <TableCell>{item.batch.name}</TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{item.faculty.name}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
