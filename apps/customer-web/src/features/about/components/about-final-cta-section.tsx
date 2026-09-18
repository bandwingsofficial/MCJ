"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

export function AboutFinalCtaSection() {
  return (
    <section className="bg-[#0B1F3A] px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-br from-[#102A56] to-[#0B1F3A] px-6 py-10 text-center sm:px-10">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">
          Ready to start learning?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300">
          Explore practical courses designed for real-world skills, or find an
          MCJ branch that&apos;s convenient for you.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/courses">
            <Button className="rounded-xl bg-white px-6 text-[#0B1F3A] hover:bg-slate-100">
              Explore Courses
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/branches">
            <Button
              variant="outline"
              className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              <MapPin className="mr-2 h-4 w-4" />
              Find a Branch
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
