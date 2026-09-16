"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Headphones,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Sparkles,
  Users,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

import { BranchUpcomingBatchesSection } from "@/src/features/branches/components/branch-upcoming-batches-section";
import { useBranchBySlugOrId } from "@/src/features/branches/hooks/useBranch";
import {
  useBranchBatches,
  useBranchCourses,
  useBranchStats,
  useBranchTrainers,
} from "@/src/features/branches/hooks/useBranchData";
import type { PublicBranch } from "@/src/features/branches/types/branch.types";
import {
  formatBranchAddress,
  formatBranchLocation,
  getGoogleMapsDirectionsUrl,
  getGoogleMapsSearchUrl,
  getBranchMapEmbedUrl,
} from "@/src/features/branches/utils/branch.utils";
import { HomePopularCourseCard } from "@/src/features/courses/components/home-popular-course-card";
import { HomePopularCourseSkeleton } from "@/src/features/courses/components/home-popular-course-skeleton";
import {
  MCJ_BRANCH_FACILITIES,
  MCJ_BRANCH_FEATURE_ITEMS,
  MCJ_CONTACT,
} from "@/src/shared/constants/site.constants";
import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  branchSlugOrId: string;
}

function Breadcrumb({ branch }: { branch: PublicBranch }) {
  return (
    <nav className="mx-auto max-w-7xl px-4 py-4 text-sm text-slate-500 sm:px-6 lg:px-8">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link href="/" className="hover:text-[#2563EB]">
            Home
          </Link>
        </li>
        <li>/</li>
        <li>
          <Link href="/branches" className="hover:text-[#2563EB]">
            Our Branches
          </Link>
        </li>
        <li>/</li>
        <li className="font-medium text-[#0B1F3A]">{branch.branchName}</li>
      </ol>
    </nav>
  );
}

function BranchHero({
  branch,
  heroImage,
  stats,
  statsLoading,
}: {
  branch: PublicBranch;
  heroImage?: string | null;
  stats: Array<{ label: string; value: string }>;
  statsLoading: boolean;
}) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#F8FBFF] via-white to-[#F5F3FF]">
      <div className="pointer-events-none absolute -left-24 top-8 h-80 w-80 rounded-full bg-[#BFDBFE]/35 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-[420px] w-[420px] rounded-full bg-[#DDD6FE]/30 blur-3xl" />
      <div className="pointer-events-none absolute right-[18%] top-16 h-72 w-72 rounded-full bg-[#93C5FD]/20 blur-[80px]" />

      <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563EB]">
            MCJ Academy
          </p>
          <h1 className="mt-2 text-3xl font-bold text-[#0B1F3A] sm:text-4xl">
            {branch.branchName}{" "}
            <span className="text-[#2563EB]">Branch</span>
          </h1>
          <p className="mt-2 text-lg font-medium text-slate-700">
            Learn. Practice. Get Placed.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-slate-600">
            {branch.description?.trim() ||
              "Practical training, expert faculty, and placement-focused learning at your nearest MCJ Academy branch."}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {(statsLoading
              ? Array.from({ length: 3 }, () => ({ label: "Loading", value: "—" }))
              : stats
            ).map((item, index) => (
              <div
                key={index}
                className="rounded-xl border border-slate-100 bg-white px-3 py-3"
              >
                <p className="text-lg font-bold text-[#0B1F3A]">{item.value}</p>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href={`/contact?branch=${branch.id}`}>
              <Button className="rounded-xl bg-[#0B1F3A] text-white hover:bg-[#102A56]">
                Enquire Now →
              </Button>
            </Link>
            <Link href="/about">
              <Button variant="outline" className="rounded-xl">
                Watch Virtual Tour
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="pointer-events-none absolute -inset-4 rounded-[36px] bg-gradient-to-br from-[#BFDBFE]/50 via-[#E9D5FF]/35 to-transparent blur-2xl" />
          <div className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_60px_rgba(37,99,235,0.12)]">
            {heroImage ? (
              <Image src={heroImage} alt={branch.branchName} fill className="object-cover" />
            ) : (
              <div className="flex h-full min-h-[320px] items-center justify-center bg-gradient-to-br from-[#DBEAFE] to-[#EDE9FE] text-[#2563EB]">
                {branch.branchCode}
              </div>
            )}
          </div>
          <div className="absolute bottom-4 right-4 max-w-xs rounded-2xl border border-slate-100 bg-white p-4 shadow-lg">
            <p className="flex items-start gap-2 text-sm font-semibold text-[#0B1F3A]">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
              {branch.branchName}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {formatBranchAddress(branch) || formatBranchLocation(branch)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function BranchFeatureStrip() {
  const featureStyles = [
    { icon: GraduationCap, bg: "bg-[#EFF6FF]", iconBg: "bg-[#DBEAFE]", text: "text-[#2563EB]" },
    { icon: Monitor, bg: "bg-[#F5F3FF]", iconBg: "bg-[#EDE9FE]", text: "text-[#7C3AED]" },
    { icon: BookOpen, bg: "bg-[#ECFEFF]", iconBg: "bg-[#CFFAFE]", text: "text-[#0891B2]" },
    { icon: Headphones, bg: "bg-[#FDF2F8]", iconBg: "bg-[#FCE7F3]", text: "text-[#DB2777]" },
    { icon: Sparkles, bg: "bg-[#EFF6FF]", iconBg: "bg-[#DBEAFE]", text: "text-[#2563EB]" },
    { icon: Users, bg: "bg-[#F5F3FF]", iconBg: "bg-[#EDE9FE]", text: "text-[#7C3AED]" },
  ] as const;

  return (
    <section className="border-y border-slate-100 bg-white/70 py-4 backdrop-blur-sm">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 sm:grid-cols-3 lg:grid-cols-6 sm:px-6 lg:px-8">
        {MCJ_BRANCH_FEATURE_ITEMS.map((item, index) => {
          const style = featureStyles[index] ?? featureStyles[0];
          const Icon = style.icon;

          return (
            <div
              key={item}
              className={cn(
                "rounded-xl border border-white/80 px-3 py-3 text-center shadow-sm",
                style.bg,
              )}
            >
              <div
                className={cn(
                  "mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full",
                  style.iconBg,
                )}
              >
                <Icon className={cn("h-4 w-4", style.text)} />
              </div>
              <p className="text-xs font-medium leading-snug text-[#0B1F3A]">
                {item}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function BranchEnquiryForm({
  branch,
  courses,
  batches,
}: {
  branch: PublicBranch;
  courses: Array<{ id: string; title: string; slug: string }>;
  batches: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [courseId, setCourseId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (!fullName.trim()) nextErrors.fullName = "Full name is required";
    if (!phone.trim()) nextErrors.phone = "Phone number is required";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    const params = new URLSearchParams({
      branch: branch.id,
      name: fullName.trim(),
      phone: phone.trim(),
    });
    if (courseId) params.set("courseId", courseId);
    if (batchId) params.set("batchId", batchId);
    router.push(`/contact?${params.toString()}`);
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-sm text-emerald-700">
        Thank you. Continue on the contact page to complete your enquiry.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-[#0B1F3A]">
        Enquire for {branch.branchName}
      </h3>
      <div>
        <input
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
          placeholder="Full Name"
          className={cn(
            "h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]",
            errors.fullName ? "border-red-400" : "border-slate-200",
          )}
        />
        {errors.fullName ? <p className="mt-1 text-xs text-red-500">{errors.fullName}</p> : null}
      </div>
      <div>
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Phone Number"
          className={cn(
            "h-11 w-full rounded-xl border px-3 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]",
            errors.phone ? "border-red-400" : "border-slate-200",
          )}
        />
        {errors.phone ? <p className="mt-1 text-xs text-red-500">{errors.phone}</p> : null}
      </div>
      <select
        value={courseId}
        onChange={(event) => setCourseId(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]"
      >
        <option value="">Interested Course</option>
        {courses.map((course) => (
          <option key={course.id} value={course.id}>
            {course.title}
          </option>
        ))}
      </select>
      <select
        value={batchId}
        onChange={(event) => setBatchId(event.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:ring-2 focus:ring-[#2563EB]"
      >
        <option value="">Preferred Batch</option>
        {batches.map((batch) => (
          <option key={batch.id} value={batch.id}>
            {batch.name}
          </option>
        ))}
      </select>
      <Button
        type="submit"
        loading={submitting}
        className="w-full rounded-xl bg-[#0B1F3A] hover:bg-[#102A56]"
      >
        Submit Enquiry
      </Button>
    </form>
  );
}

export function BranchDetailPage({ branchSlugOrId }: Props) {
  const { branch, isLoading, isError, notFound, refetch } =
    useBranchBySlugOrId(branchSlugOrId);
  const coursesQuery = useBranchCourses(branch?.id);
  const batchesQuery = useBranchBatches(branch?.id);
  const trainersQuery = useBranchTrainers(branch?.id);
  const { stats, isLoading: statsLoading } = useBranchStats(branch?.id);
  const [facilityIndex, setFacilityIndex] = useState(0);

  const courses = coursesQuery.data ?? [];
  const heroImage = branch?.thumbnailUrl ?? null;
  const courseSlugById = useMemo(
    () => new Map(courses.map((course) => [course.id, course.slug])),
    [courses],
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-6 w-64" />
        <Skeleton className="h-[420px] w-full rounded-3xl" />
      </div>
    );
  }

  if (isError || notFound || !branch) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <ErrorState
          title="Branch not found"
          description="This branch may be inactive or unavailable."
          onRetry={refetch}
        />
      </div>
    );
  }

  const mapEmbedUrl = getBranchMapEmbedUrl(branch);
  const enquiryBatches = (batchesQuery.data ?? []).map((batch) => ({
    id: batch.id,
    name: batch.name,
  }));

  return (
    <main>
      <Breadcrumb branch={branch} />
      <BranchHero
        branch={branch}
        heroImage={heroImage}
        stats={stats}
        statsLoading={statsLoading}
      />
      <BranchFeatureStrip />

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
                Courses
              </p>
              <h2 className="text-2xl font-bold text-[#0B1F3A]">
                Courses Available at {branch.branchName}
              </h2>
            </div>
            <Link href={`/courses?branch=${branch.id}`} className="text-sm font-semibold text-[#2563EB]">
              View All Courses →
            </Link>
          </div>

          {coursesQuery.isLoading ? (
            <HomePopularCourseSkeleton count={3} />
          ) : courses.length === 0 ? (
            <EmptyState
              title="No courses assigned yet"
              description="Courses assigned to this branch will appear here."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {courses.slice(0, 6).map((course) => (
                <HomePopularCourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      <BranchUpcomingBatchesSection
        branchName={branch.branchName}
        batches={batchesQuery.data ?? []}
        courseSlugById={courseSlugById}
        isLoading={batchesQuery.isLoading}
      />

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2563EB]">
                Trainers
              </p>
              <h2 className="text-2xl font-bold text-[#0B1F3A]">
                Meet Our Trainers at {branch.branchName}
              </h2>
            </div>
            <Link href={`/trainers?branch=${branch.id}`} className="text-sm font-semibold text-[#2563EB]">
              View All Trainers →
            </Link>
          </div>

          {trainersQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-56 rounded-2xl" />
              ))}
            </div>
          ) : (trainersQuery.data ?? []).length === 0 ? (
            <EmptyState
              title="No trainers listed"
              description="Trainers associated with this branch will appear here."
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(trainersQuery.data ?? []).slice(0, 8).map((trainer) => (
                <div
                  key={trainer.id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="relative h-44 bg-slate-100">
                    {trainer.profileImageUrl ? (
                      <Image
                        src={trainer.profileImageUrl}
                        alt={`${trainer.firstName} ${trainer.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">
                        No photo
                      </div>
                    )}
                    {trainer.linkedInUrl ? (
                      <a
                        href={trainer.linkedInUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-[#2563EB]"
                      >
                        <FaLinkedin className="h-4 w-4" />
                      </a>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-[#0B1F3A]">
                      {trainer.firstName} {trainer.lastName}
                    </h3>
                    <p className="text-sm text-slate-500">
                      {trainer.specialization || trainer.qualification || "Trainer"}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {trainer.experienceYears}+ years experience
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {trainer.skills.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="rounded-full bg-[#F8FBFF] px-2 py-0.5 text-[10px] font-medium text-[#2563EB]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#F8FBFF] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#0B1F3A]">Our Branch Facilities</h2>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white p-2"
                onClick={() =>
                  setFacilityIndex(
                    (current) =>
                      (current - 1 + MCJ_BRANCH_FACILITIES.length) %
                      MCJ_BRANCH_FACILITIES.length,
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="rounded-full border border-slate-200 bg-white p-2"
                onClick={() =>
                  setFacilityIndex(
                    (current) => (current + 1) % MCJ_BRANCH_FACILITIES.length,
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {MCJ_BRANCH_FACILITIES.map((facility, index) => (
              <div
                key={facility.name}
                className={cn(
                  "relative overflow-hidden rounded-2xl",
                  index === facilityIndex && "ring-2 ring-[#2563EB]",
                )}
              >
                <div className="relative h-52">
                  <Image src={facility.image} alt={facility.name} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/80 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-sm font-semibold text-white">{facility.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:px-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-bold text-[#0B1F3A]">
              Find Us at {branch.branchName}
            </h2>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                {formatBranchAddress(branch) || formatBranchLocation(branch)}
              </p>
              <p className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                {branch.phone || MCJ_CONTACT.phone}
              </p>
              <p className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#2563EB]" />
                {branch.email || MCJ_CONTACT.email}
              </p>
              <p>{MCJ_CONTACT.hours}</p>
            </div>
            {mapEmbedUrl ? (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <iframe
                  title={`Map for ${branch.branchName}`}
                  src={mapEmbedUrl}
                  className="h-56 w-full"
                  loading="lazy"
                />
              </div>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-3">
              <a href={getGoogleMapsSearchUrl(branch)} target="_blank" rel="noreferrer">
                <Button variant="outline" className="rounded-xl">
                  View on Google Maps
                </Button>
              </a>
              <a href={getGoogleMapsDirectionsUrl(branch)} target="_blank" rel="noreferrer">
                <Button className="rounded-xl bg-[#0B1F3A]">
                  Get Directions
                </Button>
              </a>
            </div>
          </div>

          <BranchEnquiryForm
            branch={branch}
            courses={courses.map((course) => ({
              id: course.id,
              title: course.title,
              slug: course.slug,
            }))}
            batches={enquiryBatches}
          />
        </div>
      </section>
    </main>
  );
}
