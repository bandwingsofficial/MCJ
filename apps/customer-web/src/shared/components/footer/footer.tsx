"use client";

import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";
import { FaFacebook, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

import { useCourses } from "@/src/features/courses/hooks/use-courses";
import { useBranches } from "@/src/features/branches/hooks/useBranches";
import {
  getBranchDetailPath,
  formatBranchLocation,
} from "@/src/features/branches/utils/branch.utils";
import {
  MCJ_CONTACT,
  MCJ_FOOTER_QUICK_LINKS,
  MCJ_SOCIAL_LINKS,
} from "@/src/shared/constants/site.constants";
import { Button } from "@/src/shared/components/ui/button";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

export function Footer() {
  const { branches, isLoading: branchesLoading } = useBranches();
  const popularCoursesQuery = useCourses({ isPopular: true });
  const fallbackCoursesQuery = useCourses({
    enabled:
      !popularCoursesQuery.isLoading &&
      (popularCoursesQuery.data?.length ?? 0) === 0,
  });

  const popularCourses =
    (popularCoursesQuery.data?.length ?? 0) > 0
      ? popularCoursesQuery.data?.slice(0, 6)
      : fallbackCoursesQuery.data?.slice(0, 6);

  const coursesLoading =
    popularCoursesQuery.isLoading || fallbackCoursesQuery.isLoading;

  return (
    <footer className="bg-[#0B1F3A] text-slate-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1.2fr] lg:px-8">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <Image
              src="/logo/MCJ_logo.png"
              alt="MCJ Academy"
              width={40}
              height={40}
              className="h-10 w-auto rounded-lg"
            />
            <span className="text-lg font-bold text-white">MCJ Academy</span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-slate-400">
            Empowering students with practical accounting skills, real-world
            training, and placement support to build successful careers.
          </p>
          <div className="mt-5 flex gap-2">
            <a href={MCJ_SOCIAL_LINKS.instagram} className="rounded-lg border border-white/10 p-2.5 text-slate-300 transition hover:border-[#2563EB]/40 hover:text-white">
              <FaInstagram className="h-4 w-4" />
            </a>
            <a href={MCJ_SOCIAL_LINKS.linkedin} className="rounded-lg border border-white/10 p-2.5 text-slate-300 transition hover:border-[#2563EB]/40 hover:text-white">
              <FaLinkedin className="h-4 w-4" />
            </a>
            <a href={MCJ_SOCIAL_LINKS.youtube} className="rounded-lg border border-white/10 p-2.5 text-slate-300 transition hover:border-[#2563EB]/40 hover:text-white">
              <FaYoutube className="h-4 w-4" />
            </a>
            <a href={MCJ_SOCIAL_LINKS.facebook} className="rounded-lg border border-white/10 p-2.5 text-slate-300 transition hover:border-[#2563EB]/40 hover:text-white">
              <FaFacebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#7DA2FF]">
            Quick Links
          </h3>
          <ul className="space-y-2.5">
            {MCJ_FOOTER_QUICK_LINKS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-slate-400 transition hover:text-white"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#7DA2FF]">
            Popular Courses
          </h3>
          {coursesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full bg-white/10" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {(popularCourses ?? []).map((course) => (
                <li key={course.id}>
                  <Link
                    href={`/courses/${course.slug}`}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {course.title}
                  </Link>
                </li>
              ))}
              {(popularCourses ?? []).length === 0 ? (
                <li className="text-sm text-slate-500">No courses available</li>
              ) : null}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#7DA2FF]">
            Our Branches
          </h3>
          {branchesLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-full bg-white/10" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2.5">
              {branches.slice(0, 8).map((branch) => (
                <li key={branch.id}>
                  <Link
                    href={getBranchDetailPath(branch)}
                    className="text-sm text-slate-400 transition hover:text-white"
                  >
                    {branch.branchName}
                    {branch.city ? `, ${branch.city}` : ""}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 className="mb-4 text-xs font-bold uppercase tracking-[0.16em] text-[#7DA2FF]">
            Contact Us
          </h3>
          <div className="space-y-4 text-sm text-slate-400">
            <div className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#7DA2FF]" />
              <p>
                {MCJ_CONTACT.phone}
                <br />
                {MCJ_CONTACT.phoneSecondary}
              </p>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#7DA2FF]" />
              <p>{MCJ_CONTACT.email}</p>
            </div>
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#7DA2FF]" />
              <p>
                {MCJ_CONTACT.addressLines.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>
          </div>
          <Link href="/contact" className="mt-5 inline-flex">
            <Button
              variant="outline"
              className="rounded-xl border-white/20 bg-transparent text-white hover:bg-white/10"
            >
              Get in Touch →
            </Button>
          </Link>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} MCJ Academy. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/legal/privacy-policy" className="hover:text-white">
              Privacy Policy
            </Link>
            <Link href="/legal/terms" className="hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
