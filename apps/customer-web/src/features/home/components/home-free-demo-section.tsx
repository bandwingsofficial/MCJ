
"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  GraduationCap,
} from "lucide-react";

const demoTopics = [
  "Accounting",
  "GST",
  "Income Tax",
  "TDS",
  "Excel",
  "Payroll",
  "Accounting Software",
];

export function HomeFreeDemoSection() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-[#F8FAFC] lg:grid-cols-2">
          {/* Left Visual Section */}
          <div className="relative flex min-h-[320px] items-center justify-center overflow-hidden bg-[#0B1F3A] p-8 sm:p-12">
            <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border-[40px] border-white/[0.04]" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative flex w-full max-w-sm flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl border border-white/10 bg-white/10 shadow-2xl">
                <GraduationCap
                  className="h-12 w-12 text-blue-300"
                  strokeWidth={1.5}
                />
              </div>

              <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                MCJ Accounting Training Institute
              </p>

              <h3 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">
                Experience Learning Before You Enrol
              </h3>

              <div className="mt-8 flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.06] px-5 py-3">
                <CalendarDays className="h-5 w-5 text-blue-300" />
                <span className="text-sm font-medium text-slate-200">
                  Free Demo Classes
                </span>
              </div>
            </div>
          </div>

          {/* Right Content Section */}
          <div className="flex flex-col justify-center p-7 sm:p-10 lg:p-12">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              <span className="h-2 w-2 rounded-full bg-green-500" />
              Upcoming Free Demo Classes
            </div>

            <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-[#0B1F3A] sm:text-4xl">
              Attend a Free Accounting{" "}
              <span className="text-[#2563EB]">Demo Class</span>
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Experience MCJ's practical training approach before enrolling.
              Explore upcoming demo sessions on accounting, GST, Income Tax,
              TDS, Excel, Payroll and accounting software. Register for an
              upcoming demo class and learn more about our training programmes.
            </p>

            <div className="mt-6">
              <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#0B1F3A]">
                Explore Demo Topics
              </p>

              <div className="flex flex-wrap gap-2">
                {demoTopics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB]" />
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#2563EB] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700"
              >
                Register for Free Demo
                <ArrowRight className="h-4 w-4" />
              </Link>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Clock3 className="h-4 w-4 text-[#2563EB]" />
                Contact us for upcoming timings
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
