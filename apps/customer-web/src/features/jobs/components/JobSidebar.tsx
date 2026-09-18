"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  CalendarClock,
  Hourglass,
  IndianRupee,
  MapPin,
  Monitor,
  Users,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
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
        <Icon className="h-4 w-4 shrink-0 text-[#2563EB]" />
        <span>{label}</span>
      </div>
      <span className="text-right text-sm font-semibold text-[#0B1F3A]">
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
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
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
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] text-sm font-bold text-[#2563EB]">
      {initials || "CO"}
    </div>
  );
}

export function JobSidebar({ job }: JobSidebarProps) {
  const router = useRouter();
  const accepting = isJobAcceptingApplications(job);
  const keySkills = [...job.skills, ...(job.preferredSkills ?? [])];

  return (
    <aside className="space-y-4 lg:sticky lg:top-20">
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_8px_28px_rgba(11,31,58,0.06)] sm:p-5">
        {accepting ? (
          <Button
            size="lg"
            className="h-11 w-full rounded-xl bg-[#0B1F3A] text-sm font-semibold text-white hover:bg-[#102A56]"
            onClick={() => router.push(`/jobs/${job.slug}/apply`)}
          >
            Apply Now
          </Button>
        ) : (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-center text-sm text-amber-800">
            Applications closed
          </p>
        )}

        <div className="mt-4 space-y-0">
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
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_rgba(11,31,58,0.04)] sm:p-5">
          <h3 className="text-sm font-bold text-[#0B1F3A]">Key Skills</h3>
          <div className="mt-3">
            <SkillPills skills={keySkills} limit={8} />
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_2px_12px_rgba(11,31,58,0.04)] sm:p-5">
        <h3 className="text-sm font-bold text-[#0B1F3A]">Company</h3>
        <div className="mt-3 flex items-start gap-3">
          <CompanyLogo name={job.companyName} logo={job.companyLogo} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0B1F3A]">
              {job.companyName}
            </p>
            <p className="mt-1 text-xs text-slate-500">{locationLabel(job)}</p>
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
