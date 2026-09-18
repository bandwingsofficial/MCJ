"use client";

import { Briefcase, GraduationCap, Wrench } from "lucide-react";

const APPROACH_ITEMS = [
  {
    icon: Wrench,
    title: "Practical Learning",
    description:
      "Hands-on training focused on real workplace skills through live projects and practical accounting workflows.",
  },
  {
    icon: GraduationCap,
    title: "Industry-Relevant Skills",
    description:
      "Courses designed around practical tools and current workplace requirements in accounting and taxation.",
  },
  {
    icon: Briefcase,
    title: "Career-Focused Training",
    description:
      "Learning that helps students build confidence for real job roles and become job-ready from day one.",
  },
] as const;

export function AboutApproachSection() {
  return (
    <section className="border-y border-slate-100 bg-[#F8FBFF] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
            Our Approach
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
            How we prepare learners for the workplace
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Our programmes combine practical training, expert mentorship, and
            career support so students can apply what they learn with confidence.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {APPROACH_ITEMS.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_2px_12px_rgba(11,31,58,0.03)]"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-[#0B1F3A]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
