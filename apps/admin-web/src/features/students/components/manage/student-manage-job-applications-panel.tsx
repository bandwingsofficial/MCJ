"use client";

import { useEffect, useMemo, useState } from "react";
import { ClipboardList, Eye } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Tooltip } from "@/src/shared/components/ui/tooltip";

import {
  BRANCH_ICON_BUTTON_CLASS,
  BRANCH_ICON_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-section";
import { BRANCH_TABLE_CARD_CLASS } from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import { BranchManagePaginationFooter } from "@/src/features/branches/components/manage/branch-manage-pagination-footer";
import {
  BranchManageTableShell,
  TABLE_CELL_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { JobApplicationDetailsDialog } from "@/src/features/job-applications/components/JobApplicationDetailsDialog";
import { JobApplicationInterviewStatusBadge } from "@/src/features/job-applications/components/JobApplicationInterviewStatusBadge";
import { JobApplicationStatusBadge } from "@/src/features/job-applications/components/JobApplicationStatusBadge";
import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import type { Student } from "@/src/features/students/types/student.types";

const JOB_APPLICATION_COLUMNS = [
  { key: "applicationNumber", label: "Application #" },
  { key: "jobTitle", label: "Job Applied For" },
  { key: "company", label: "Company" },
  { key: "status", label: "Application Status" },
  { key: "appliedDate", label: "Applied Date" },
  { key: "interviewStatus", label: "Interview Status" },
  { key: "actions", label: "Actions", className: "w-24 text-right" },
];

const DEFAULT_PAGE_SIZE = 10;

interface Props {
  student: Student;
}

export function StudentManageJobApplicationsPanel({ student }: Props) {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const loadJobApplications = async () => {
    const response = await jobApplicationService.getJobApplications({
      studentId: student.id,
    });
    setJobApplications(response.items);
    setError(null);
  };

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await jobApplicationService.getJobApplications({
          studentId: student.id,
        });

        if (!cancelled) {
          setJobApplications(response.items);
        }
      } catch (err) {
        if (!cancelled) {
          setJobApplications([]);
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load job applications.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [student.id]);

  const total = jobApplications.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const from = total === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const to = total === 0 ? 0 : Math.min(safePage * pageSize, total);

  const paginatedApplications = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return jobApplications.slice(start, start + pageSize);
  }, [jobApplications, safePage, pageSize]);

  if (error) {
    return (
      <ErrorState
        title="Unable to load job applications"
        description={error}
        onRetry={() => {
          void loadJobApplications().catch((err) => {
            setError(
              err instanceof Error
                ? err.message
                : "Unable to load job applications.",
            );
          });
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="min-w-0">
        <h2 className="text-[22px] font-bold tracking-tight text-[#102A56] sm:text-[26px]">
          Job Applications
        </h2>
        <p className="text-xs text-[#647A9B] sm:text-[13px]">
          Job applications for {student.studentCode}
        </p>
      </div>

      <Card className={BRANCH_TABLE_CARD_CLASS}>
        <BranchManageTableShell
          columns={JOB_APPLICATION_COLUMNS}
          isLoading={isLoading}
          isEmpty={!isLoading && total === 0}
          emptyTitle="No job applications found"
          emptyDescription="This student has not applied for any jobs yet."
          emptyIcon={ClipboardList}
          embedded
        >
          {paginatedApplications.map((application) => (
            <tr
              key={application.id}
              className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
            >
              <td className={`${TABLE_CELL_CLASS} font-mono text-slate-700`}>
                {application.applicationNumber}
              </td>
              <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                {application.job.title}
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {application.job.companyName}
              </td>
              <td className={TABLE_CELL_CLASS}>
                <JobApplicationStatusBadge status={application.status} />
              </td>
              <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                {new Date(application.createdAt).toLocaleDateString("en-IN")}
              </td>
              <td className={TABLE_CELL_CLASS}>
                <JobApplicationInterviewStatusBadge
                  status={application.interviewStatus}
                />
              </td>
              <td className={`${TABLE_CELL_CLASS} text-right`}>
                <Tooltip content="View application details">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApplication(application);
                      setDetailsOpen(true);
                    }}
                    aria-label="View job application details"
                    className={`${BRANCH_ICON_BUTTON_CLASS} text-[#2563EB]`}
                  >
                    <Eye className={BRANCH_ICON_CLASS} />
                  </button>
                </Tooltip>
              </td>
            </tr>
          ))}
        </BranchManageTableShell>

        <BranchManagePaginationFooter
          from={from}
          to={to}
          total={total}
          page={safePage}
          pageSize={pageSize}
          totalPages={totalPages}
          disabled={isLoading}
          onPageChange={setPage}
          onPageSizeChange={(nextPageSize) => {
            setPageSize(nextPageSize);
            setPage(1);
          }}
        />
      </Card>

      <JobApplicationDetailsDialog
        open={detailsOpen}
        application={selectedApplication}
        onClose={() => {
          setDetailsOpen(false);
          setSelectedApplication(null);
        }}
        onApprove={() => undefined}
        onReject={() => undefined}
      />
    </div>
  );
}
