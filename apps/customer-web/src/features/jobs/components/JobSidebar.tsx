"use client";

import Image from "next/image";
import Link from "next/link";
import { Briefcase, CalendarClock, Hourglass, IndianRupee, MapPin, Monitor, Users } from "lucide-react";

import { SkillPills } from "@/src/features/jobs/components/job-skill-pills";
import type { Job } from "@/src/features/jobs/types/job.types";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";
import {
  companyInitials,
  employmentLabel,
  experienceLabel,
  formatDeadlineDate,
  locationLabel,
  salaryLabel,
  workModeLabel,
} from "@/src/features/jobs/utils/job-display.utils";

interface JobSidebarProps {
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
    <div className="flex items-start justify-between gap-3 border-b border-slate-100 py-2.5 last:border-b-0">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <span>{label}</span>
      </div>
      <span className="text-right text-sm font-medium text-slate-900">
        {value}
      </span>
    </div>
  );
}

function CompanyLogo({
  name,
  logo,
}: {
  name: string;
  logo: string | null;
}) {
  const initials = companyInitials(name);

  if (logo) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <Image
          src={logo}
          alt={name}
          fill
          className="object-contain p-1.5"
          sizes="48px"
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-bold text-[#2563D9]">
      {initials || "CO"}
    </div>
  );
}

export function JobSidebar({ job }: JobSidebarProps) {
  const accepting = isJobAcceptingApplications(job);
  const keySkills = [...job.skills, ...(job.preferredSkills ?? [])];

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        {accepting ? (
          <Link
            href={`/jobs/${job.slug}/apply`}
            className="hidden h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-[#2563D9] to-[#1746A2] text-sm font-semibold text-white transition hover:from-[#1E58C7] hover:to-[#123D94] lg:inline-flex"
          >
            Apply Now
          </Link>
        ) : (
          <p className="hidden rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-800 lg:block">
            Applications closed
          </p>
        )}

        <div className={accepting ? "mt-4 space-y-0" : "space-y-0"}>
          <SummaryRow
            icon={Hourglass}
            label="Experience"
            value={experienceLabel(job)}
          />
          <SummaryRow
            icon={IndianRupee}
            label="Salary"
            value={salaryLabel(job)}
          />
          <SummaryRow
            icon={Briefcase}
            label="Employment"
            value={employmentLabel(job)}
          />
          <SummaryRow
            icon={MapPin}
            label="Location"
            value={locationLabel(job)}
          />
          <SummaryRow
            icon={Monitor}
            label="Work Mode"
            value={workModeLabel(job)}
          />
          <SummaryRow
            icon={Users}
            label="Vacancies"
            value={`${job.vacancies}`}
          />
          <SummaryRow
            icon={CalendarClock}
            label="Deadline"
            value={formatDeadlineDate(job.applicationDeadline)}
          />
        </div>
      </div>

      {keySkills.length > 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Key Skills</h3>
          <div className="mt-3">
            <SkillPills skills={keySkills} limit={8} />
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Company</h3>
        <div className="mt-3 flex items-start gap-3">
          <CompanyLogo name={job.companyName} logo={job.companyLogo} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900">
              {job.companyName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {locationLabel(job)}
            </p>
          </div>
        </div>
        {job.companyDescription ? (
          <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-600">
            {job.companyDescription}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
