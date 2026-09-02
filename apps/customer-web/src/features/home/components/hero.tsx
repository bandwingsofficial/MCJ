"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DM_Sans, Playfair_Display } from "next/font/google";

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-playfair",
});

const stats = [
  { value: "5000+", label: "Students Placed" },
  { value: "98%", label: "Pass Rate" },
  { value: "12+", label: "Years of Excellence" },
  { value: "200+", label: "Hiring Partners" },
];

const badges = [
  {
    label: "OFFLINE COURSES",
    className: "border-[#dde1e8] bg-[#f0f2f5] text-[#4a5568]",
  },
  {
    label: "LIVE CLASSES",
    className: "border-[#c5d8f5] bg-[#e8f0fa] text-[#1a3460]",
  },
  {
    label: "100% PLACEMENT",
    className: "border-[#e2cc99] bg-[#f5edd8] text-[#b8922a]",
  },
];

const courses = [
  {
    name: "Tally Prime & ERP 9",
    meta: "3 Months · Offline + Live",
    tag: "Popular",
  },
  {
    name: "GST & Taxation Expert",
    meta: "2 Months · Live Batch",
    tag: "New",
  },
  {
    name: "Financial Accounting",
    meta: "4 Months · Comprehensive",
    tag: "Certified",
  },
];

export function HeroSection() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 80);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section
      className={`${dmSans.variable} ${playfair.variable} relative isolate min-h-[calc(100svh-76px)] overflow-hidden bg-white font-[var(--font-dm-sans)]`}
    >
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-44 -top-52 -z-10 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_60%_40%,#f5edd8_0%,#fdf8ef_50%,transparent_72%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-52 -left-44 -z-10 h-[400px] w-[400px] rounded-full bg-[radial-gradient(circle,#e8f0fa_0%,transparent_70%)]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-px w-40 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#d4a84b] to-transparent"
      />

      {/* =========================================================
          HERO CONTAINER
      ========================================================= */}

      <div className="mx-auto grid min-h-[calc(100svh-76px)] w-full max-w-[1280px] grid-cols-1 items-center gap-7 px-5 py-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:items-start lg:gap-10 lg:px-8 lg:pt-[40px] xl:gap-12">
        {/* =======================================================
            LEFT
        ======================================================= */}

        <div className="flex min-w-0 flex-col">
          {/* Badges */}

          <div
            className={`mb-3 flex flex-wrap gap-2 transition-all duration-500 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            {badges.map((badge) => (
              <span
                key={badge.label}
                className={`rounded-full border px-3 py-[5px] text-[9px] font-normal uppercase tracking-[0.08em] ${badge.className}`}
              >
                {badge.label}
              </span>
            ))}
          </div>

          {/* Headline */}

          <h1
            className={`max-w-[720px] font-[var(--font-playfair)] text-[clamp(40px,4vw,58px)] font-bold leading-[1.23] tracking-[-0.02em] text-[#0f2044] transition-all duration-500 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
            }`}
          >
            <span className="font-bold">Learn. Practice.</span>{" "}
            <span className="relative inline-block font-bold text-[#b8922a]">
              Progress.
              <span className="absolute -bottom-0.5 left-0 h-[2px] w-full rounded-full bg-gradient-to-r from-[#d4a84b] to-transparent" />
            </span>
          </h1>

          {/* Subtitle */}

          <p
            className={`mt-1.5 font-[var(--font-playfair)] text-[clamp(16px,1.9vw,24px)] font-normal italic leading-tight text-[#1a3460] transition-all delay-100 duration-500 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            Build skills that move your career forward
          </p>

          {/* Divider */}

          <div
            className={`my-3.5 h-[2px] w-14 rounded-full bg-gradient-to-r from-[#b8922a] to-transparent transition-opacity delay-150 duration-500 ${
              visible ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Description */}

          <p
            className={`mb-6 max-w-[500px] text-[14px] font-light leading-[1.55] text-[#5a6478] transition-all delay-200 duration-500 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            Explore industry-aligned courses with expert instructors, flexible
            batches, and a learning experience designed to help you grow.
          </p>

          {/* CTA */}

          <div
            className={`flex flex-wrap items-center gap-3 transition-all delay-300 duration-500 ease-out ${
              visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={() => router.push("/courses")}
              className="group relative overflow-hidden rounded-md bg-[#0f2044] px-6 py-2.5 text-[13px] font-medium tracking-[0.01em] text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#1a3460] hover:shadow-md"
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-[#d4a84b]/15 to-transparent transition-transform duration-500 group-hover:translate-x-full" />

              <span className="relative">Explore Courses</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/contact")}
              className="rounded-md border border-[#e8e0cf] bg-white px-5 py-2.5 text-[13px] font-normal text-[#0f2044] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#d4a84b] hover:text-[#b8922a]"
            >
              Talk to an Advisor →
            </button>
          </div>

          {/* =====================================================
              STATS
          ===================================================== */}

          <div
            className={`mt-5 grid grid-cols-2 border-t border-[#e8e0cf] pt-3.5 transition-all delay-400 duration-500 ease-out sm:grid-cols-4 ${
              visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
            }`}
          >
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`
                  min-w-0
                  ${index === 0 ? "pr-3" : "border-l border-[#e8e0cf] px-3"}
                  ${
                    index === 1
                      ? "border-r-0 sm:border-r sm:border-[#e8e0cf]"
                      : ""
                  }
                  ${
                    index === 2
                      ? "mt-3 border-l-0 border-t border-[#e8e0cf] pl-0 pt-3 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0"
                      : ""
                  }
                  ${
                    index === 3
                      ? "mt-3 border-t border-[#e8e0cf] pt-3 sm:mt-0 sm:border-t-0 sm:pt-0"
                      : ""
                  }
                `}
              >
                <div className="font-[var(--font-playfair)] text-[21px] font-normal leading-none text-[#0f2044]">
                  {stat.value}
                </div>

                <div className="mt-1 whitespace-nowrap text-[8px] font-normal uppercase tracking-[0.045em] text-[#5a6478] sm:text-[9px]">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =======================================================
            RIGHT CARD
        ======================================================= */}

        <div
  className={`relative flex items-center justify-center transition-all delay-150 duration-[600ms] ease-out max-lg:hidden ${
    visible ? "translate-x-0 opacity-100" : "translate-x-5 opacity-0"
  }`}
>
  {/* Admissions badge */}

  <div className="absolute -right-2 -top-3 z-20 flex items-center gap-2 rounded-xl border border-[#e8e0cf] bg-white px-3.5 py-2.5 shadow-[0_4px_18px_rgba(15,32,68,0.09)] xl:-right-4">
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-40" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
    </span>

    <span className="whitespace-nowrap text-[10px] font-normal text-[#0f2044]">
      Admissions Open 2026
    </span>
  </div>

  {/* Main Card */}

  <div className="relative mt-0 w-full max-w-[465px] overflow-hidden rounded-[16px] border border-[#e8e0cf] bg-white p-6 shadow-[0_2px_26px_rgba(15,32,68,0.06),0_1px_4px_rgba(15,32,68,0.04)]">
    {/* Top gradient */}

    <div className="absolute left-0 right-0 top-0 h-[3px] bg-gradient-to-r from-[#b8922a] to-[#1a3460]" />

    {/* Institute header */}

    <div className="mb-4 flex items-center gap-3.5">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[10px] bg-[#0f2044] font-[var(--font-playfair)] text-[18px] font-normal tracking-[-0.5px] text-[#d4a84b]">
        MCJ
      </div>

      <div className="min-w-0">
        <div className="truncate font-[var(--font-playfair)] text-[17px] font-normal leading-tight text-[#0f2044]">
          MCJ Institute of Accounting
        </div>

        <div className="mt-1 text-[10px] font-light text-[#5a6478]">
          Professional · Certified · Trusted
        </div>
      </div>
    </div>

    {/* Course List */}

    <div className="flex flex-col gap-2.5">
      {courses.map((course) => (
        <div
          key={course.name}
          className="group flex items-center gap-3 rounded-[10px] border border-[#e8e0cf] bg-[#fdf8ef] px-4 py-3 transition-colors duration-200 hover:border-[#d4a84b]"
        >
          {/* Icon */}

          <div className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-lg bg-[#0f2044]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="2"
                width="6"
                height="6"
                rx="1.5"
                fill="#d4a84b"
              />

              <rect
                x="10"
                y="2"
                width="6"
                height="6"
                rx="1.5"
                fill="rgba(212,168,75,0.5)"
              />

              <rect
                x="2"
                y="10"
                width="6"
                height="6"
                rx="1.5"
                fill="rgba(212,168,75,0.5)"
              />

              <rect
                x="10"
                y="10"
                width="6"
                height="6"
                rx="1.5"
                fill="#d4a84b"
              />
            </svg>
          </div>

          {/* Course info */}

          <div className="min-w-0 flex-1">
            <div className="truncate text-[13px] font-normal text-[#0f2044]">
              {course.name}
            </div>

            <div className="mt-0.5 truncate text-[10px] font-light text-[#5a6478]">
              {course.meta}
            </div>
          </div>

          {/* Tag */}

          <div className="shrink-0 rounded-full border border-[#e2cc99] bg-[#f5edd8] px-2.5 py-1 text-[8px] font-normal text-[#b8922a]">
            {course.tag}
          </div>
        </div>
      ))}
    </div>

    {/* Placement */}

    <div className="mt-3 flex items-center gap-3 rounded-[10px] bg-[#0f2044] px-4 py-3">
      <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-lg bg-[#d4a84b]/20">
        <svg
          width="17"
          height="17"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 2L11 7H16L12 10.5L13.5 16L9 13L4.5 16L6 10.5L2 7H7L9 2Z"
            fill="#d4a84b"
          />
        </svg>
      </div>

      <div className="min-w-0">
        <div className="text-[12px] font-normal text-[#d4a84b]">
          100% Placement Guarantee
        </div>

        <div className="mt-0.5 text-[9px] font-light text-white/55">
          5000+ alumni placed across India
        </div>
      </div>
    </div>
  </div>
</div>
      </div>
    </section>
  );
}
