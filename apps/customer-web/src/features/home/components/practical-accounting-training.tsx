
"use client";

import {
  Calculator,
  FileSpreadsheet,
  Receipt,
  Landmark,
  Wallet,
  BookOpen,
  BarChart3,
  ClipboardCheck,
} from "lucide-react";

const trainingTopics = [
  {
    icon: Calculator,
    title: "Practical Accounting and Tally Prime",
  },
  {
    icon: FileSpreadsheet,
    title: "Basic and Advanced Excel",
  },
  {
    icon: Receipt,
    title: "GST Computation and Return Filing",
  },
  {
    icon: Landmark,
    title: "Income Tax and TDS",
  },
  {
    icon: Wallet,
    title: "Payroll and Salary Statement Preparation",
  },
  {
    icon: BookOpen,
    title: "Zoho Books",
  },
  {
    icon: BarChart3,
    title: "Financial Statements and MIS Reporting",
  },
  {
    icon: ClipboardCheck,
    title: "PF, ESI and PT Compliance",
  },
];

export function PracticalAccountingTraining() {
  return (
    <section className="relative overflow-hidden bg-[#F8FAFC] py-12 sm:py-16">
      <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-9 max-w-3xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <span className="h-px w-7 bg-[#b8922a]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#b8922a]">
              Practical Accounting Training
            </span>
            <span className="h-px w-7 bg-[#b8922a]" />
          </div>

          <h2 className="text-2xl font-bold leading-tight tracking-tight text-[#2563EB] sm:text-3xl lg:text-[34px]">
            Learn Accounting Through Practical Training
          </h2>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            At MCJ, our focus is on helping students understand how
            accounting activities are performed in real working
            environments.
          </p>
        </div>

        {/* Training Topics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {trainingTopics.map((topic, index) => {
            const Icon = topic.icon;

            return (
              <div
                key={topic.title}
                className="group flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#2563EB] transition-colors group-hover:bg-[#2563EB] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <span className="mb-1 block text-[10px] font-semibold tracking-wide text-blue-500">
                    TOPIC {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-sm font-semibold leading-snug text-[#0B1F3A]">
                    {topic.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Information */}
        <div className="mt-8 rounded-2xl border border-blue-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#2563EB]">
              <BookOpen className="h-6 w-6" />
            </div>

            <p className="text-sm leading-7 text-slate-600 sm:text-base">
              Students get opportunities to practise accounting
              activities using simulation software and practical
              exercises.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
