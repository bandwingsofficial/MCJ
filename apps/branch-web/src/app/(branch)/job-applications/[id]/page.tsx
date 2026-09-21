"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import type { InterviewRoundItem } from "@/src/features/branch-ops/types";
import { BranchJobApplicationStatusBadge } from "@/src/features/job-applications/components/BranchJobApplicationStatusBadge";
import {
  formatInterviewDateTime,
  formatInterviewMode,
  isInterviewScheduled,
} from "@/src/features/job-applications/utils/job-application-display.utils";
import { isValidInterviewSchedule } from "@/src/features/interviews/utils/interview-display.utils";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Input } from "@/src/shared/components/ui/input";
import { Loader } from "@/src/shared/components/ui/loader";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Textarea } from "@/src/shared/components/ui/textarea";
import { appToast } from "@/src/shared/components/ui/toast";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

interface PageProps {
  params: Promise<{ id: string }>;
}

type BranchApplicationDetail = {
  id: string;
  applicationNumber?: string;
  applicantName?: string | null;
  applicantEmail?: string | null;
  applicantPhone?: string | null;
  highestQualification?: string | null;
  yearsOfExperience?: number | null;
  currentLocation?: string | null;
  coverLetter?: string | null;
  remarks?: string | null;
  rejectionReason?: string | null;
  status?: string;
  interviewStatus?: string;
  createdAt?: string;
  expectedSalary?: number | null;
  job?: {
    id?: string;
    title?: string;
    companyName?: string;
    jobNumber?: string | null;
    employmentType?: string;
    slug?: string;
  };
  student?: {
    studentCode?: string;
    firstName?: string;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    qualification?: string | null;
    collegeName?: string | null;
    specialization?: string | null;
    city?: string | null;
    state?: string | null;
    gender?: string | null;
  } | null;
  resume?: {
    url?: string;
    originalName?: string;
    mimeType?: string;
    size?: number;
  } | null;
  interviews?: Array<{
    id: string;
    scheduledAt?: string | null;
    status: string;
    mode?: string | null;
    locationOrLink?: string | null;
    notes?: string | null;
    roundId?: string | null;
    roundNumber?: number;
    result?: string | null;
    durationMinutes?: number;
    round?: {
      id: string;
      name: string;
      sortOrder: number;
    } | null;
    branch?: {
      id: string;
      branchName: string;
      branchCode: string;
    } | null;
    interviewer?: {
      id: string;
      name?: string;
      email?: string;
    } | null;
  }>;
};

function Info({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[#102A56]">{value || "—"}</p>
    </div>
  );
}

function toDateInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60_000);
  return local.toISOString().slice(0, 10);
}

function toTimeInputValue(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toTimeString().slice(0, 5);
}

export default function JobApplicationDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const router = useRouter();
  const scheduleRef = useRef<HTMLDivElement | null>(null);

  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.jobApplication(id),
    [id],
  );

  const application = (data as BranchApplicationDetail | null) ?? null;
  const activeInterview = useMemo(() => {
    if (!application?.interviews?.length) return null;
    return (
      application.interviews.find((item) => item.status === "ASSIGNED") ??
      application.interviews.find((item) => item.status === "SCHEDULED") ??
      application.interviews[0]
    );
  }, [application]);

  const scheduled = isInterviewScheduled(activeInterview);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [openSchedule, setOpenSchedule] = useState(false);

  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [mode, setMode] = useState<"ONLINE" | "OFFLINE">("ONLINE");
  const [locationOrLink, setLocationOrLink] = useState("");
  const [roundId, setRoundId] = useState("");
  const [notes, setNotes] = useState("");
  const [rounds, setRounds] = useState<InterviewRoundItem[]>([]);
  const [roundsLoading, setRoundsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const syncHash = () => {
      setOpenSchedule(window.location.hash === "#schedule");
    };
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [id]);

  useEffect(() => {
    if (!activeInterview) {
      setInterviewDate("");
      setInterviewTime("");
      setMode("ONLINE");
      setLocationOrLink("");
      setRoundId("");
      setNotes("");
      return;
    }

    setInterviewDate(toDateInputValue(activeInterview.scheduledAt));
    setInterviewTime(toTimeInputValue(activeInterview.scheduledAt));
    setMode(activeInterview.mode === "OFFLINE" ? "OFFLINE" : "ONLINE");
    setLocationOrLink(activeInterview.locationOrLink ?? "");
    setRoundId(activeInterview.roundId ?? activeInterview.round?.id ?? "");
    setNotes(activeInterview.notes ?? "");
  }, [activeInterview]);

  useEffect(() => {
    if (!showScheduleForm) return;

    let cancelled = false;
    const loadRounds = async () => {
      try {
        setRoundsLoading(true);
        const active = await branchOpsApi.activeInterviewRounds();
        if (cancelled) return;
        setRounds(active);
        setRoundId((current) => {
          if (current && active.some((round) => round.id === current)) {
            return current;
          }
          return (
            activeInterview?.roundId ||
            activeInterview?.round?.id ||
            ""
          );
        });
      } catch {
        if (!cancelled) {
          setRounds([]);
        }
      } finally {
        if (!cancelled) {
          setRoundsLoading(false);
        }
      }
    };

    void loadRounds();
    return () => {
      cancelled = true;
    };
  }, [showScheduleForm, activeInterview]);

  useEffect(() => {
    setShowScheduleForm(openSchedule && Boolean(activeInterview));
  }, [openSchedule, activeInterview]);

  useEffect(() => {
    if (openSchedule && showScheduleForm && scheduleRef.current) {
      scheduleRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [openSchedule, showScheduleForm, loading]);

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!application) return <EmptyState title="Application not found." />;

  const studentName =
    [application.student?.firstName, application.student?.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || application.applicantName;

  const canSubmit =
    Boolean(interviewDate) &&
    Boolean(interviewTime) &&
    Boolean(locationOrLink.trim()) &&
    Boolean(roundId) &&
    !roundsLoading &&
    !submitting;

  const handleSchedule = async () => {
    if (!canSubmit) return;

    const scheduledAt = new Date(`${interviewDate}T${interviewTime}:00`);
    if (Number.isNaN(scheduledAt.getTime())) {
      appToast.error("Enter a valid interview date and time.");
      return;
    }

    try {
      setSubmitting(true);
      await branchOpsApi.scheduleInterview({
        applicationId: application.id,
        scheduledAt: scheduledAt.toISOString(),
        mode,
        locationOrLink: locationOrLink.trim(),
        notes: notes.trim() || undefined,
        roundId,
      });
      appToast.success(
        scheduled
          ? "Interview schedule updated successfully."
          : "Interview scheduled successfully.",
      );
      router.replace(`/job-applications/${application.id}`);
      await reload();
      setShowScheduleForm(false);
      setOpenSchedule(false);
    } catch (scheduleError) {
      appToast.error(
        scheduleError instanceof Error
          ? scheduleError.message
          : "Unable to schedule interview.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="px-1 py-1">
        <nav
          aria-label="Breadcrumb"
          className="mb-1 flex items-center gap-1 text-xs"
        >
          <Link
            href="/job-applications"
            className="text-[#647A9B] transition-colors hover:text-[#2563EB]"
          >
            Job Applications
          </Link>
          <ChevronRight
            className="h-3.5 w-3.5 text-slate-400"
            aria-hidden="true"
          />
          <span aria-current="page" className="font-medium text-[#102A56]">
            {application.applicationNumber ?? "Application"}
          </span>
        </nav>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
              {application.applicationNumber ?? "Application"}
            </h1>
            <p className="mt-1 text-sm text-[#647A9B]">
              {application.job?.title || "Job application details"}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <BranchJobApplicationStatusBadge status={application.status} />
              {activeInterview ? (
                <Badge
                  variant={scheduled ? "success" : "warning"}
                  className="px-2 py-0 text-[11px] font-semibold leading-5"
                >
                  {scheduled ? "Scheduled" : "Not Scheduled"}
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/job-applications")}
            >
              Back to list
            </Button>
            {activeInterview ? (
              <Button
                onClick={() => {
                  setShowScheduleForm(true);
                  setOpenSchedule(true);
                  window.location.hash = "schedule";
                }}
              >
                {scheduled ? "Manage Interview" : "Schedule Interview"}
              </Button>
            ) : null}
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 border-[#E1EBF5] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#102A56]">
            Candidate Information
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Full Name" value={studentName} />
            <Info label="Student ID" value={application.student?.studentCode} />
            <Info
              label="Email"
              value={application.student?.email || application.applicantEmail}
            />
            <Info
              label="Phone"
              value={application.student?.phone || application.applicantPhone}
            />
            <Info
              label="Qualification"
              value={
                application.student?.qualification ||
                application.highestQualification
              }
            />
            <Info label="College" value={application.student?.collegeName} />
            <Info
              label="Specialization"
              value={application.student?.specialization}
            />
            <Info
              label="Experience"
              value={
                application.yearsOfExperience == null
                  ? null
                  : `${application.yearsOfExperience} years`
              }
            />
            <Info
              label="Location"
              value={
                application.currentLocation ||
                [application.student?.city, application.student?.state]
                  .filter(Boolean)
                  .join(", ")
              }
            />
            <Info label="Gender" value={application.student?.gender} />
          </div>
        </Card>

        <Card className="space-y-4 border-[#E1EBF5] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#102A56]">
            Job Information
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info label="Job" value={application.job?.title} />
            <Info label="Company" value={application.job?.companyName} />
            <Info
              label="Job ID"
              value={application.job?.jobNumber || application.job?.id}
            />
            <Info
              label="Employment Type"
              value={application.job?.employmentType?.replaceAll("_", " ")}
            />
          </div>
        </Card>

        <Card className="space-y-4 border-[#E1EBF5] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#102A56]">
            Application Information
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Info
              label="Application ID"
              value={application.applicationNumber || application.id}
            />
            <Info
              label="Applied Date"
              value={
                application.createdAt
                  ? new Date(application.createdAt).toLocaleString("en-IN")
                  : null
              }
            />
            <Info label="Status" value={application.status} />
            <Info
              label="Expected Salary"
              value={
                application.expectedSalary == null
                  ? null
                  : `₹${application.expectedSalary.toLocaleString("en-IN")}`
              }
            />
          </div>
          {application.resume?.url ? (
            <a
              href={application.resume.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-medium text-[#2563EB] hover:underline"
            >
              View resume
              {application.resume.originalName
                ? ` (${application.resume.originalName})`
                : ""}
            </a>
          ) : (
            <p className="text-sm text-[#647A9B]">No resume uploaded.</p>
          )}
          {application.rejectionReason ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-800">
              <span className="font-medium">Rejection reason: </span>
              {application.rejectionReason}
            </div>
          ) : null}
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
              Cover Letter / Remarks
            </p>
            <p className="mt-1 text-sm text-[#102A56]">
              {application.coverLetter ||
                application.remarks ||
                "No cover letter provided."}
            </p>
          </div>
        </Card>

        <Card className="space-y-4 border-[#E1EBF5] p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#102A56]">Assignment</h2>
          {activeInterview ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Info
                label="Branch"
                value={
                  activeInterview.branch
                    ? `${activeInterview.branch.branchName} (${activeInterview.branch.branchCode})`
                    : null
                }
              />
              <Info
                label="Interviewer"
                value={
                  activeInterview.interviewer
                    ? `${activeInterview.interviewer.name ?? "—"}${
                        activeInterview.interviewer.email
                          ? ` · ${activeInterview.interviewer.email}`
                          : ""
                      }`
                    : null
                }
              />
              <Info
                label="Assignment Status"
                value="Assigned"
              />
              <Info
                label="Interview Status"
                value={scheduled ? "Scheduled" : "Not Scheduled"}
              />
            </div>
          ) : (
            <EmptyState title="No interviewer assignment found." />
          )}
        </Card>

        <div ref={scheduleRef} className="lg:col-span-2">
        <Card
          className="space-y-4 border-[#E1EBF5] p-5 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-[#102A56]">Interview</h2>
            {activeInterview && !showScheduleForm ? (
              <Button
                size="sm"
                onClick={() => {
                  setShowScheduleForm(true);
                  setOpenSchedule(true);
                  window.location.hash = "schedule";
                }}
              >
                {scheduled ? "Manage Interview" : "Schedule Interview"}
              </Button>
            ) : null}
          </div>

          {activeInterview ? (
            <div className="rounded-xl border border-[#E1EBF5] bg-[#F8FBFF] p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                <Badge
                  variant={scheduled ? "success" : "warning"}
                  className="px-2 py-0 text-[11px] font-semibold leading-5"
                >
                  {scheduled ? "Scheduled" : "Not Scheduled"}
                </Badge>
                {activeInterview.mode ? (
                  <Badge
                    variant="default"
                    className="px-2 py-0 text-[11px] font-semibold leading-5"
                  >
                    {formatInterviewMode(activeInterview.mode)}
                  </Badge>
                ) : null}
                <Badge
                  variant="default"
                  className="px-2 py-0 text-[11px] font-semibold leading-5"
                >
                  {activeInterview.round?.name ??
                    (activeInterview.roundNumber
                      ? `Round ${activeInterview.roundNumber}`
                      : "Round")}
                </Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Info
                  label="Date & Time"
                  value={
                    isValidInterviewSchedule(activeInterview.scheduledAt)
                      ? formatInterviewDateTime(activeInterview.scheduledAt)
                      : "Not scheduled"
                  }
                />
                <Info
                  label="Mode"
                  value={formatInterviewMode(activeInterview.mode)}
                />
                <Info
                  label={
                    activeInterview.mode === "ONLINE"
                      ? "Meeting Link"
                      : "Venue"
                  }
                  value={activeInterview.locationOrLink}
                />
              </div>
              {activeInterview.notes ? (
                <p className="mt-3 text-sm text-[#647A9B]">
                  <span className="font-medium text-[#102A56]">Remarks: </span>
                  {activeInterview.notes}
                </p>
              ) : null}
            </div>
          ) : (
            <EmptyState title="No interview assignment available to schedule." />
          )}

          {activeInterview && showScheduleForm ? (
            <div className="space-y-3 border-t border-[#E1EBF5] pt-4">
              <p className="text-sm font-medium text-[#102A56]">
                {scheduled ? "Update interview schedule" : "Schedule interview"}
              </p>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    Interview Date
                  </label>
                  <Input
                    type="date"
                    value={interviewDate}
                    disabled={submitting}
                    onChange={(event) => setInterviewDate(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    Interview Time
                  </label>
                  <Input
                    type="time"
                    value={interviewTime}
                    disabled={submitting}
                    onChange={(event) => setInterviewTime(event.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    Round
                  </label>
                  <AppSelect
                    value={roundId || undefined}
                    disabled={submitting || roundsLoading || rounds.length === 0}
                    placeholder={
                      roundsLoading
                        ? "Loading rounds..."
                        : rounds.length === 0
                          ? "No active rounds"
                          : "Select round"
                    }
                    options={rounds.map((round) => ({
                      label: round.name,
                      value: round.id,
                    }))}
                    onValueChange={setRoundId}
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    Interview Mode
                  </label>
                  <AppSelect
                    value={mode}
                    disabled={submitting}
                    options={[
                      { label: "Online", value: "ONLINE" },
                      { label: "Offline", value: "OFFLINE" },
                    ]}
                    onValueChange={(value) => {
                      setMode(value as "ONLINE" | "OFFLINE");
                      setLocationOrLink("");
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#647A9B]">
                    {mode === "ONLINE" ? "Meeting Link" : "Venue"}
                  </label>
                  <Input
                    value={locationOrLink}
                    disabled={submitting}
                    placeholder={
                      mode === "ONLINE"
                        ? "https://meet.example.com/..."
                        : "Branch address / room"
                    }
                    onChange={(event) => setLocationOrLink(event.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#647A9B]">
                  Remarks / Interview Notes (optional)
                </label>
                <Textarea
                  value={notes}
                  disabled={submitting}
                  className="min-h-20"
                  placeholder="Notes for the interview..."
                  onChange={(event) => setNotes(event.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2">
                {scheduled ? (
                  <Button
                    variant="outline"
                    disabled={submitting}
                    onClick={() => {
                      setShowScheduleForm(false);
                      setOpenSchedule(false);
                      router.replace(`/job-applications/${application.id}`);
                    }}
                  >
                    Cancel
                  </Button>
                ) : null}
                <Button
                  loading={submitting}
                  disabled={!canSubmit}
                  onClick={() => {
                    void handleSchedule();
                  }}
                >
                  {scheduled
                    ? "Update Interview Schedule"
                    : "Save Interview Schedule"}
                </Button>
              </div>
            </div>
          ) : null}
        </Card>
        </div>
      </div>
    </div>
  );
}
