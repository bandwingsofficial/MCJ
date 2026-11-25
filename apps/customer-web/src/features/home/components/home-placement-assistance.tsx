
"use client";

import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  GraduationCap,
  MessageSquareQuote,
  TrendingUp,
} from "lucide-react";

const placementHighlights = [
  {
    icon: GraduationCap,
    number: "01",
    title: "Student Placement Stories",
    description:
      "Discover genuine experiences of MCJ students who have progressed towards accounting and finance careers.",
    label: "STUDENT JOURNEYS",
  },
  {
    icon: MessageSquareQuote,
    number: "02",
    title: "Student Testimonials",
    description:
      "Read feedback from learners about their training experience, practical learning, and career guidance at MCJ.",
    label: "REAL EXPERIENCES",
  },
  {
    icon: TrendingUp,
    number: "03",
    title: "Latest Job Updates",
    description:
      "Stay informed about accounting and finance job opportunities and relevant employment updates.",
    label: "CAREER OPPORTUNITIES",
  },
];

export function HomePlacementAssistanceSection() {
  return (
    <section className="overflow-hidden bg-[#F8FAFC] py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Placement Banner */}
        <div className="relative overflow-hidden rounded-[28px] bg-[#0B1F3A] px-6 py-10 text-white sm:px-10 sm:py-14 lg:px-14">
          {/* Decorative Elements */}
          <div className="pointer-events-none absolute -right-20 -top-28 h-80 w-80 rounded-full border-[45px] border-white/[0.04]" />
          <div className="pointer-events-none absolute -bottom-36 right-1/4 h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2">
                <BriefcaseBusiness className="h-4 w-4 text-blue-300" />
                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-200">
                  Career Support at MCJ Academy
                </span>
              </div>

              <h2 className="mt-6 max-w-2xl text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                Accounting Course with{" "}
                <span className="text-[#60A5FA]">
                  Placement Assistance
                </span>{" "}
                in Bangalore
              </h2>

              <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                MCJ provides placement assistance to help students explore
                accounting and finance job opportunities. Our placement
                support helps students prepare for employment through
                practical skill development and career guidance.
              </p>

              <Link
                href="/placement-assistance"
                className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#0B1F3A] transition-all duration-200 hover:bg-blue-50"
              >
                Explore Placement Assistance
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Visual Element */}
            <div className="relative mx-auto flex w-full max-w-xs items-center justify-center lg:max-w-none">
              <div className="relative flex aspect-square w-full max-w-[270px] items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
                <div className="absolute inset-5 rounded-full border border-dashed border-blue-300/30" />
                <div className="absolute inset-10 rounded-full bg-blue-500/10" />

                <div className="relative flex h-28 w-28 items-center justify-center rounded-3xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur">
                  <BriefcaseBusiness
                    className="h-14 w-14 text-blue-300"
                    strokeWidth={1.4}
                  />
                </div>

                <div className="absolute right-1 top-12 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>

                <div className="absolute bottom-8 left-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg">
                  <GraduationCap className="h-6 w-6 text-[#2563EB]" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Placement Support Highlights */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {placementHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.number}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
                    <Icon className="h-6 w-6" />
                  </div>

                  <span className="text-3xl font-bold text-slate-100">
                    {item.number}
                  </span>
                </div>

                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.16em] text-[#2563EB]">
                  {item.label}
                </p>

                <h3 className="mt-2 text-lg font-bold text-[#0B1F3A]">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
