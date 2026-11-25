
"use client";

import {
  MapPin,
  MonitorPlay,
  PlayCircle,
  ArrowUpRight,
} from "lucide-react";

const learningModes = [
  {
    number: "01",
    label: "IN-PERSON LEARNING",
    title: "Classroom Training",
    description:
      "Attend instructor-led classes at an MCJ branch and practise accounting activities using dedicated computers.",
    icon: MapPin,
    features: [
      "Direct trainer interaction",
      "Dedicated computer practice",
      "Classroom learning environment",
    ],
    style: "bg-[#0B1F3A] text-white",
    iconStyle: "bg-white/10 text-white",
    numberStyle: "text-white/20",
  },
  {
    number: "02",
    label: "LEARN FROM ANYWHERE",
    title: "Live Online Classes",
    description:
      "Learn from anywhere through live online sessions with trainer interaction and recording access for additional practice.",
    icon: MonitorPlay,
    features: [
      "Live trainer interaction",
      "Learn from any location",
      "Recording access for practice",
    ],
    style: "bg-[#EFF6FF] text-[#0B1F3A]",
    iconStyle: "bg-blue-100 text-[#2563EB]",
    numberStyle: "text-blue-200",
  },
  {
    number: "03",
    label: "SELF-PACED LEARNING",
    title: "Pre-recorded Video Courses",
    description:
      "Learn at your own pace with recorded learning modules and study materials that you can access for convenient revision.",
    icon: PlayCircle,
    features: [
      "Flexible learning schedule",
      "Recorded learning modules",
      "Study materials included",
    ],
    style: "bg-[#F8FAFC] text-[#0B1F3A]",
    iconStyle: "bg-indigo-100 text-indigo-600",
    numberStyle: "text-slate-200",
  },
];

export function HomeLearningModesSection() {
  return (
    <section className="bg-white py-14 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto mb-10 max-w-3xl text-center sm:mb-14">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
            Flexible Learning Options
          </p>

          <h2 className="mt-3 text-3xl font-bold leading-tight tracking-tight text-[#0B1F3A] sm:text-4xl">
            Choose Your Preferred{" "}
            <span className="text-[#2563EB]">
              Accounting Training Mode
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Choose a learning format that fits your schedule, location, and
            learning preferences at MCJ Academy.
          </p>
        </div>

        {/* Learning Mode Panels */}
        <div className="grid gap-5 lg:grid-cols-3">
          {learningModes.map((mode) => {
            const Icon = mode.icon;

            return (
              <article
                key={mode.number}
                className={`group relative flex min-h-full flex-col overflow-hidden rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${mode.style}`}
              >
                {/* Background Number */}
                <span
                  aria-hidden="true"
                  className={`pointer-events-none absolute -right-2 -top-8 text-[130px] font-black leading-none ${mode.numberStyle}`}
                >
                  {mode.number}
                </span>

                {/* Icon and Label */}
                <div className="relative">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${mode.iconStyle}`}
                  >
                    <Icon className="h-7 w-7" strokeWidth={1.8} />
                  </div>

                  <p className="mt-7 text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">
                    {mode.label}
                  </p>

                  <h3 className="mt-2 text-2xl font-bold leading-tight">
                    {mode.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 opacity-80">
                    {mode.description}
                  </p>
                </div>

                {/* Divider */}
                <div className="my-6 border-t border-current/10" />

                {/* Features */}
                <ul className="mt-auto space-y-3">
                  {mode.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm font-medium"
                    >
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-current/10">
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Bottom Accent */}
                <div className="mt-8 flex items-center justify-between">
                  <span className="text-xs font-semibold opacity-60">
                    MCJ Academy
                  </span>
                  <ArrowUpRight
                    className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1"
                  />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
