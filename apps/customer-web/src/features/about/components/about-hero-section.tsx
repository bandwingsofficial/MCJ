"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

export function AboutHeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-white">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#EFF6FF] to-transparent" />
      <div className="pointer-events-none absolute -right-16 top-8 h-56 w-56 rounded-full bg-[#E0E7FF]/50 blur-3xl" />
      <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-[#EDE9FE]/40 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 sm:py-9 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:px-8 lg:py-10">
        {/* Left — editorial copy */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#2563EB]">
            About MCJ Training Institute
          </p>

          <h1 className="mt-2.5 text-3xl font-bold leading-[1.12] tracking-tight text-[#0B1F3A] sm:text-[2.35rem]">
            Empowering Skills.
            <span className="mt-0.5 block text-[#2563EB]">
              Building Careers.
            </span>
          </h1>

          <p className="mt-3.5 max-w-xl text-sm leading-relaxed text-slate-600">
            MCJ Institute is a leading training institute focused on delivering
            industry-relevant accounting and taxation education. With expert
            trainers, live projects, and placement support, we ensure every
            student is job-ready from day one.
          </p>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link href="/courses">
              <Button className="h-10 rounded-xl px-5 text-sm">
                Explore Courses
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/branches">
              <Button
                variant="outline"
                className="h-10 rounded-xl border-slate-200 bg-white px-5 text-sm text-[#0B1F3A]"
              >
                <MapPin className="mr-2 h-4 w-4 text-[#2563EB]" />
                Our Branches
              </Button>
            </Link>
          </div>
        </div>

        {/* Right — framed image with subtle depth */}
        <div className="relative mx-auto w-full max-w-lg lg:mx-0 lg:max-w-none">
          <div className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-gradient-to-br from-[#BFDBFE]/50 via-transparent to-[#DDD6FE]/45 blur-md" />
          <div className="pointer-events-none absolute -right-3 -top-3 h-20 w-20 rounded-2xl border border-[#BFDBFE]/70 bg-[#EFF6FF]/60" />
          <div className="pointer-events-none absolute -bottom-3 -left-3 h-16 w-16 rounded-2xl border border-[#DDD6FE]/80 bg-[#F5F3FF]/70" />

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-100 shadow-[0_16px_40px_rgba(11,31,58,0.10)]">
            <div className="relative aspect-[4/3] w-full">
              <Image
                src="/why/Image-Expert-Mentors.jpg"
                alt="MCJ Training Institute classroom and mentors"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 480px"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/35 via-transparent to-transparent" />
            </div>

            <div className="absolute bottom-3 left-3 right-3 rounded-xl border border-white/20 bg-[#0B1F3A]/80 px-3.5 py-2.5 backdrop-blur-sm sm:left-auto sm:right-3 sm:max-w-[240px]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#93C5FD]">
                Our purpose
              </p>
              <p className="mt-1 text-xs leading-relaxed text-white">
                Practical accounting education that empowers students to build
                successful careers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
