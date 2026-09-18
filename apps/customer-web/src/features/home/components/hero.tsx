"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Play, Sparkles } from "lucide-react";

import { useHomeStats } from "@/src/features/home/hooks/use-home-stats";
import { Button } from "@/src/shared/components/ui/button";

const heroBenefits = [
  "Practical Training",
  "Live Projects",
  "Expert Mentors",
  "Placement Support",
];

export function HeroSection() {
  const { stats, isLoading } = useHomeStats();

  return (
    <section className="relative overflow-hidden bg-[#F8FBFF]">
      {/* Soft blurred background extending fully behind the left content */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[65%] bg-gradient-to-br from-[#E8F0FF]/80 via-[#F4F6FF]/70 to-transparent blur-2xl" />

      <div className="pointer-events-none absolute -left-20 top-10 h-96 w-96 rounded-full bg-[#E0E7FF]/60 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-[-120px] h-96 w-96 rounded-full bg-[#DBEAFE]/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 top-0 h-80 w-80 rounded-full bg-[#EDE9FE]/50 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-14">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#BFDBFE] bg-white px-3 py-1.5 text-xs font-semibold text-[#2563EB]">
            <Sparkles className="h-3.5 w-3.5" />
            Bangalore&apos;s Trusted Learning Partner
          </div>

          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-[#0B1F3A] sm:text-5xl lg:text-[3.35rem]">
            Future-Ready Skills for a{" "}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              Brighter You
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
            Build accounting, HR, and business skills with practical training,
            expert mentors, and placement-focused learning at MCJ Academy.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href="/courses">
              <Button className="h-11 rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-5 text-white hover:from-[#2860D4] hover:to-[#1A3F96]">
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>

            <Link href="/about">
              <Button
                variant="outline"
                className="h-11 rounded-xl border-slate-200 bg-white px-5 text-[#0B1F3A]"
              >
                <Play className="mr-2 h-4 w-4" />
                Watch Video
              </Button>
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(isLoading
              ? Array.from({ length: 4 }, () => ({
                  label: "...",
                  value: "—",
                }))
              : stats
            ).map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-100 bg-white px-3 py-3"
              >
                <p className="text-lg font-bold text-[#0B1F3A]">
                  {item.value}
                </p>
                <p className="text-[11px] text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="relative overflow-hidden rounded-[28px] border border-white bg-white shadow-[0_24px_60px_rgba(11,31,58,0.12)]">
            <Image
              src="/images/student-learning.png"
              alt="MCJ Academy student"
              width={640}
              height={640}
              priority
              className="h-auto w-full object-cover"
            />
          </div>

          <div className="absolute -left-3 top-8 hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-lg sm:block">
            {heroBenefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-2 py-1 text-xs font-medium text-[#0B1F3A]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[#2563EB]" />
                {benefit}
              </div>
            ))}
          </div>

          <div className="absolute -bottom-4 right-4 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-lg">
            <p className="text-xs font-semibold text-[#0B1F3A]">
              Join happy learners at MCJ Academy
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Practical training · Placement support
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}