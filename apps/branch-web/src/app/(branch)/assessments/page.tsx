"use client";

import { useState } from "react";
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
import { Textarea } from "@/src/shared/components/ui/textarea";
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

const TYPES = ["TEST", "PRESENTATION", "ASSIGNMENT", "PRACTICAL", "OTHER"] as const;

const schema = z
  .object({
    batchId: z.string().min(1, "Batch is required"),
    studentId: z.string().min(1, "Student is required"),
    type: z.enum(TYPES),
    name: z.string().min(2, "Assessment name is required"),
    date: z.string().min(1, "Date is required"),
    maxMarks: z.number().gt(0, "Maximum marks must be greater than 0"),
    obtainedMarks: z.number().min(0, "Marks cannot be negative"),
    remarks: z.string().optional(),
  })
  .refine((value) => value.obtainedMarks <= value.maxMarks, {
    message: "Obtained marks cannot exceed maximum marks",
    path: ["obtainedMarks"],
  });

type FormValues = z.infer<typeof schema>;

export default function AssessmentsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const [typeFilter, setTypeFilter] = useState("");
  const batchesQuery = useAsyncData(() => branchOpsApi.batches(), []);
  const listQuery = useAsyncData(
    () =>
      branchOpsApi.assessments(typeFilter ? { type: typeFilter } : undefined),
    [typeFilter],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      batchId: "",
      studentId: "",
      type: "TEST",
      name: "",
      date: new Date().toISOString().slice(0, 10),
      maxMarks: 100,
      obtainedMarks: 0,
      remarks: "",
    },
  });

  const batchId = form.watch("batchId");
  const studentsQuery = useAsyncData(
    () =>
      batchId
        ? branchOpsApi.batch(batchId).then((batch) => batch.students ?? [])
        : Promise.resolve([]),
    [batchId],
  );

  const onSubmit = async (values: FormValues) => {
    try {
      await branchOpsApi.createAssessment(values);
      appToast.success("Marks saved");
      form.reset({
        ...values,
        name: "",
        obtainedMarks: 0,
        remarks: "",
      });
      await listQuery.reload();
    } catch {
      appToast.error("Unable to save marks");
    }
  };

  const invalid = !form.formState.isValid || form.formState.isSubmitting;

  return (
    <div>
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Marks / Assessments"
        title="Marks / Assessments"
        totalLabel="Assessments"
        total={listQuery.data?.length ?? 0}
      />

      <Card className="mb-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Batch
            </label>
            <AppSelect
              value={form.watch("batchId")}
              onValueChange={(value) => {
                form.setValue("batchId", value, { shouldValidate: true });
                form.setValue("studentId", "", { shouldValidate: true });
              }}
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
              Student
            </label>
            <AppSelect
              value={form.watch("studentId")}
              onValueChange={(value) =>
                form.setValue("studentId", value, { shouldValidate: true })
              }
              options={(studentsQuery.data ?? []).map((student) => ({
                label: `${student.firstName} ${student.lastName ?? ""}`.trim(),
                value: student.id,
              }))}
              placeholder="Select student"
            />
            <FormError message={form.formState.errors.studentId?.message} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Type
            </label>
            <AppSelect
              value={form.watch("type")}
              onValueChange={(value) =>
                form.setValue("type", value as FormValues["type"], {
                  shouldValidate: true,
                })
              }
              options={TYPES.map((type) => ({ label: type, value: type }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Assessment name
            </label>
            <Input
              className={cn(
                form.formState.errors.name && "border-red-400",
                form.watch("name") && !form.formState.errors.name && "border-emerald-400",
              )}
              {...form.register("name")}
            />
            <FormError message={form.formState.errors.name?.message} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Date
            </label>
            <Input type="date" {...form.register("date")} />
            <FormError message={form.formState.errors.date?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Max marks
              </label>
              <Input type="number" step="0.5" {...form.register("maxMarks", { valueAsNumber: true })} />
              <FormError message={form.formState.errors.maxMarks?.message} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
                Obtained
              </label>
              <Input type="number" step="0.5" {...form.register("obtainedMarks", { valueAsNumber: true })} />
              <FormError message={form.formState.errors.obtainedMarks?.message} />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase text-slate-500">
              Remarks
            </label>
            <Textarea rows={3} className="min-h-[80px]" {...form.register("remarks")} />
          </div>
          <div>
            <Button type="submit" disabled={invalid} loading={form.formState.isSubmitting}>
              Save marks
            </Button>
          </div>
        </form>
      </Card>

      <div className="mb-4 max-w-xs">
        <AppSelect
          value={typeFilter || "ALL"}
          onValueChange={(value) => setTypeFilter(value === "ALL" ? "" : value)}
          options={[
            { label: "All types", value: "ALL" },
            ...TYPES.map((type) => ({ label: type, value: type })),
          ]}
        />
      </div>

      {listQuery.loading ? (
        <Loader />
      ) : listQuery.error ? (
        <ErrorState description={listQuery.error} onRetry={listQuery.reload} />
      ) : !listQuery.data?.length ? (
        <EmptyState title="No assessment records found." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Batch</TableHead>
              <TableHead>Assessment</TableHead>
              <TableHead>Marks</TableHead>
              <TableHead>%</TableHead>
              <TableHead>Faculty</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {listQuery.data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.student.name}</TableCell>
                <TableCell>{item.batch.name}</TableCell>
                <TableCell>
                  {item.name}
                  <div className="text-xs text-slate-400">{item.type}</div>
                </TableCell>
                <TableCell>
                  {item.obtainedMarks}/{item.maxMarks}
                </TableCell>
                <TableCell>{item.percentage}%</TableCell>
                <TableCell>{item.faculty.name}</TableCell>
                <TableCell>{item.date?.toString().slice(0, 10)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
