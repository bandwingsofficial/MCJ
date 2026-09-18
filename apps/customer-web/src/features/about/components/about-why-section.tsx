"use client";

import {
  Award,
  CalendarClock,
  Handshake,
  Users,
  UserCheck,
  Wrench,
} from "lucide-react";

import { MCJ_WHY_FEATURES } from "@/src/shared/constants/site.constants";

const FEATURE_ICONS = [
  Users,
  Wrench,
  UserCheck,
  CalendarClock,
  Handshake,
  Award,
] as const;

export function AboutWhySection() {
  return (
    <section className="bg-[#0B1F3A] py-14 text-white sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7DA2FF]">
            Why Choose MCJ
          </p>
          <h2 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">
            More than a course.{" "}
            <span className="bg-gradient-to-r from-[#60A5FA] to-[#A78BFA] bg-clip-text text-transparent">
              A brighter future.
            </span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-300">
            We combine practical accounting training, expert mentorship, and
            placement support to help learners become job-ready professionals.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MCJ_WHY_FEATURES.map((feature, index) => {
            const Icon = FEATURE_ICONS[index] ?? Award;

            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-5"
              >
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-[#9EC5FF]">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-white">
                  {feature.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-slate-300">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
