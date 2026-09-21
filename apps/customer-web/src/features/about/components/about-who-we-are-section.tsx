"use client";

import { Compass, Target } from "lucide-react";

export function AboutWhoWeAreSection() {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto grid max-w-7xl items-start gap-10 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
            Who We Are
          </p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0B1F3A] sm:text-4xl">
            A practical training institute for accounting careers
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            MCJ Academy is a leading training institute focused on delivering
            industry-relevant accounting and taxation education.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            With expert trainers, live projects, and placement support, we ensure
            every student is job-ready from day one.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:text-base">
            We are driven by quality education and career success—helping
            learners build the confidence and workplace skills needed for real
            accounting roles.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-100 bg-[#F8FBFF] p-5 sm:p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#DBEAFE] text-[#2563EB]">
              <Target className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#0B1F3A]">Our Mission</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              To provide high-quality, practical accounting education that
              empowers students to build successful careers.
            </p>
          </div>

          <div className="rounded-2xl border border-[#E0E7FF] bg-[#F5F3FF]/60 p-5 sm:p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#EDE9FE] text-[#7C3AED]">
              <Compass className="h-5 w-5" />
            </div>
            <h3 className="text-lg font-semibold text-[#0B1F3A]">Our Vision</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              To become a trusted leader in accounting education by producing
              industry-ready professionals.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
