"use client";

import type { ReactNode } from "react";
import {
  Building2,
  CheckCircle2,
  Globe,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

import type { Job } from "@/src/features/jobs/types/job.types";
import { locationLabel } from "@/src/features/jobs/utils/job-display.utils";
import { SkillPills } from "@/src/features/jobs/components/job-skill-pills";

interface JobDetailsProps {
  job: Job;
}

function ContentSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 py-6 last:border-b-0">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function BenefitList({ benefits }: { benefits: string }) {
  const items = benefits
    .split(/\n+/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length <= 1) {
    return (
      <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
        {benefits}
      </p>
    );
  }

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li
          key={item}
          className="flex gap-2.5 text-sm leading-6 text-slate-600"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
          <span>{item.replace(/^[-•*]\s*/, "")}</span>
        </li>
      ))}
    </ul>
  );
}

export function JobDetails({ job }: JobDetailsProps) {
  const description =
    job.description?.trim() ||
    job.shortDescription?.trim() ||
    "No description provided.";

  return (
    <div>
      <ContentSection title="Job Description">
        <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600 sm:text-[15px]">
          {description}
        </p>
      </ContentSection>

      {job.responsibilities?.length ? (
        <ContentSection title="Responsibilities">
          <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 sm:text-[15px]">
            {job.responsibilities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </ContentSection>
      ) : null}

      {job.skills?.length ? (
        <ContentSection title="Required Skills">
          <SkillPills skills={job.skills} />
        </ContentSection>
      ) : null}

      {job.qualifications?.length || job.eligibilityTitle ? (
        <ContentSection title="Qualifications">
          {job.qualifications?.length ? (
            <ul className="list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600 sm:text-[15px]">
              {job.qualifications.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
          {job.eligibilityTitle ? (
            <p
              className={
                job.qualifications?.length
                  ? "mt-3 text-sm leading-7 text-slate-600"
                  : "text-sm leading-7 text-slate-600"
              }
            >
              {job.eligibilityTitle}
            </p>
          ) : null}
        </ContentSection>
      ) : null}

      {job.interviewProcess?.length ? (
        <ContentSection title="Interview Process">
          <ol className="space-y-0">
            {job.interviewProcess.map((round, index) => (
              <li
                key={`${round.title}-${index}`}
                className="relative flex gap-4 pb-6 last:pb-0"
              >
                {index < job.interviewProcess.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute left-[13px] top-7 h-[calc(100%-12px)] w-px bg-slate-200"
                  />
                ) : null}
                <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#2563D9] bg-white text-xs font-bold text-[#2563D9]">
                  {index + 1}
                </span>
                <div className="min-w-0 pt-0.5">
                  <h3 className="text-sm font-semibold text-slate-900 sm:text-base">
                    {round.title}
                  </h3>
                  {round.description ? (
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {round.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        </ContentSection>
      ) : null}

      {job.benefits ? (
        <ContentSection title="Benefits">
          <BenefitList benefits={job.benefits} />
        </ContentSection>
      ) : null}

      <ContentSection title="Company Information">
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
              <p className="font-semibold text-slate-900">{job.companyName}</p>
              {job.companyDescription ? (
                <p className="mt-2 leading-6">{job.companyDescription}</p>
              ) : null}
            </div>
          </div>

          {job.companyWebsite ? (
            <a
              href={job.companyWebsite}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 text-[#2563D9] hover:underline"
            >
              <Globe className="h-4 w-4 shrink-0" />
              {job.companyWebsite.replace(/^https?:\/\//, "")}
            </a>
          ) : null}

          {job.companyEmail ? (
            <a
              href={`mailto:${job.companyEmail}`}
              className="flex items-center gap-2 hover:text-slate-900"
            >
              <Mail className="h-4 w-4 shrink-0 text-slate-400" />
              {job.companyEmail}
            </a>
          ) : null}

          {job.companyPhone ? (
            <a
              href={`tel:${job.companyPhone}`}
              className="flex items-center gap-2 hover:text-slate-900"
            >
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              {job.companyPhone}
            </a>
          ) : null}

          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <span>{locationLabel(job)}</span>
          </div>
        </div>
      </ContentSection>
    </div>
  );
}
