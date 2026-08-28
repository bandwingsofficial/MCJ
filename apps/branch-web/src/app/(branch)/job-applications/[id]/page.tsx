"use client";

import { use } from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Card } from "@/src/shared/components/ui/card";
import { Badge } from "@/src/shared/components/ui/badge";
import { FormError } from "@/src/shared/components/ui/form-error";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { appToast } from "@/src/shared/lib/toast";

const scheduleSchema = z.object({
  scheduledAt: z.string().min(1, "Interview date and time are required"),
  mode: z.enum(["ONLINE", "OFFLINE", "PHONE"]),
  locationOrLink: z.string().optional(),
  notes: z.string().optional(),
});

type ScheduleValues = z.infer<typeof scheduleSchema>;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function JobApplicationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.jobApplication(id),
    [id],
  );
  const [decisionLoading, setDecisionLoading] = useState<string | null>(null);

  const form = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      scheduledAt: "",
      mode: "ONLINE",
      locationOrLink: "",
      notes: "",
    },
  });

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <EmptyState title="Application not found." />;

  const application = data as {
    applicationNumber?: string;
    applicantName?: string;
    applicantEmail?: string;
    applicantPhone?: string;
    status?: string;
    coverLetter?: string;
    job?: { title?: string; companyName?: string };
    resume?: { url?: string; originalName?: string } | null;
    interviews?: Array<{
      id: string;
      scheduledAt: string;
      status: string;
      mode: string;
      evaluation?: string | null;
    }>;
  };

  const schedule = async (values: ScheduleValues) => {
    try {
      await branchOpsApi.scheduleInterview({
        applicationId: id,
        scheduledAt: new Date(values.scheduledAt).toISOString(),
        mode: values.mode,
        locationOrLink: values.locationOrLink,
        notes: values.notes,
      });
      appToast.success("Interview scheduled");
      await reload();
    } catch {
      appToast.error("Unable to schedule interview");
    }
  };

  const decide = async (interviewId: string, decision: "SELECTED" | "REJECTED") => {
    try {
      setDecisionLoading(decision);
      await branchOpsApi.updateInterview(interviewId, {
        status: "COMPLETED",
        decision,
        evaluation: `Candidate ${decision.toLowerCase()}`,
      });
      appToast.success(`Candidate ${decision.toLowerCase()}`);
      await reload();
    } catch {
      appToast.error("Unable to update decision");
    } finally {
      setDecisionLoading(null);
    }
  };

  return (
    <div>
      <PageHeader
        title={application.applicationNumber ?? "Application"}
        description={application.job?.title}
      />
      <div className="mb-6 flex flex-wrap gap-2">
        <Badge variant="info">{application.status}</Badge>
        <span className="text-sm text-slate-600">
          {application.applicantName} · {application.applicantEmail}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-sm font-semibold text-slate-700">Candidate</h2>
          <p className="mt-2 text-sm">{application.applicantName}</p>
          <p className="text-sm text-slate-500">{application.applicantPhone}</p>
          <p className="mt-3 text-sm text-slate-600">
            {application.coverLetter || "No cover letter provided."}
          </p>
          {application.resume?.url ? (
            <a
              href={application.resume.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-block text-sm text-indigo-600 hover:underline"
            >
              View resume
            </a>
          ) : null}
        </Card>

        <Card>
          <h2 className="mb-4 text-sm font-semibold text-slate-700">
            Schedule interview
          </h2>
          <form className="space-y-3" onSubmit={form.handleSubmit(schedule)}>
            <Input type="datetime-local" {...form.register("scheduledAt")} />
            <FormError message={form.formState.errors.scheduledAt?.message} />
            <AppSelect
              value={form.watch("mode")}
              onValueChange={(value) =>
                form.setValue("mode", value as ScheduleValues["mode"])
              }
              options={[
                { label: "Online", value: "ONLINE" },
                { label: "Offline", value: "OFFLINE" },
                { label: "Phone", value: "PHONE" },
              ]}
            />
            <Input placeholder="Meeting link or location" {...form.register("locationOrLink")} />
            <Textarea placeholder="Notes" className="min-h-[80px]" {...form.register("notes")} />
            <Button type="submit" loading={form.formState.isSubmitting}>
              Schedule
            </Button>
          </form>
        </Card>
      </div>

      <h2 className="mt-8 mb-3 text-sm font-semibold text-slate-700">Interviews</h2>
      {!application.interviews?.length ? (
        <EmptyState title="No interviews scheduled." />
      ) : (
        <div className="space-y-3">
          {application.interviews.map((interview) => (
            <Card key={interview.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">
                  {new Date(interview.scheduledAt).toLocaleString()} · {interview.mode}
                </p>
                <p className="text-xs text-slate-500">{interview.status}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={decisionLoading !== null}
                  onClick={() => void decide(interview.id, "SELECTED")}
                >
                  Select
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  disabled={decisionLoading !== null}
                  onClick={() => void decide(interview.id, "REJECTED")}
                >
                  Reject
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
