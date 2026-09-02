import {
  Briefcase,
  Building2,
  Calendar,
  Hash,
  IndianRupee,
  MapPin,
} from "lucide-react";

import type { Job } from "@/src/features/jobs/types/job.types";
import {
  deadlineLabel,
  employmentLabel,
  experienceLabel,
  salaryLabel,
  workModeLabel,
} from "@/src/features/jobs/utils/public-job-apply.utils";

interface JobApplySummaryProps {
  job: Job;
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#647A9B]" aria-hidden />
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
          {label}
        </dt>
        <dd className="mt-0.5 text-sm font-medium text-[#102A56]">{value}</dd>
      </div>
    </div>
  );
}

export function JobApplySummary({ job }: JobApplySummaryProps) {
  const salary = salaryLabel(job);
  const deadline = deadlineLabel(job.applicationDeadline);
  const description = job.shortDescription?.trim() || job.description?.trim();

  return (
    <article className="rounded-2xl border border-[#DCE8F5] bg-white p-5 shadow-[0_8px_24px_rgba(16,42,86,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#2563EB]">
        You are applying for
      </p>
      <h1 className="mt-2 text-xl font-bold leading-snug tracking-tight text-[#102A56] sm:text-2xl">
        {job.title}
      </h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#647A9B]">
        <Building2 className="h-4 w-4 shrink-0" aria-hidden />
        {job.companyName}
      </p>

      <dl className="mt-5 space-y-3.5 border-t border-[#E8F1FF] pt-4">
        {job.jobNumber ? (
          <SummaryRow icon={Hash} label="Job Number" value={job.jobNumber} />
        ) : null}
        <SummaryRow
          icon={MapPin}
          label="Location"
          value={job.location || job.city || "Not specified"}
        />
        <SummaryRow
          icon={Briefcase}
          label="Employment Type"
          value={employmentLabel(job.employmentType)}
        />
        <SummaryRow
          icon={Briefcase}
          label="Work Mode"
          value={workModeLabel(job.workMode)}
        />
        <SummaryRow
          icon={Briefcase}
          label="Experience Required"
          value={experienceLabel(job)}
        />
        {salary ? (
          <SummaryRow icon={IndianRupee} label="Salary Range" value={salary} />
        ) : null}
        {deadline ? (
          <SummaryRow
            icon={Calendar}
            label="Application Deadline"
            value={deadline}
          />
        ) : null}
      </dl>

      {description ? (
        <div className="mt-4 border-t border-[#E8F1FF] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            About the Role
          </p>
          <p className="mt-2 line-clamp-6 text-sm leading-relaxed text-[#102A56]">
            {description}
          </p>
        </div>
      ) : null}

      {job.skills?.length ? (
        <div className="mt-4 border-t border-[#E8F1FF] pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            Key Skills
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {job.skills.slice(0, 8).map((skill) => (
              <li
                key={skill}
                className="rounded-full bg-[#F8FBFF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]"
              >
                {skill}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}
