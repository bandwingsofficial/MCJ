"use client";

import Link from "next/link";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import type { UserProfile } from "@/src/features/auth/types/auth.types";
import type { StudentProfile } from "@/src/features/student/types";

interface EnrollmentStudentInfoProps {
  authUser: UserProfile | null;
  studentProfile: StudentProfile | null;
  isLoading: boolean;
  profileError: string | null;
}

export function EnrollmentStudentInfo({
  authUser,
  studentProfile,
  isLoading,
  profileError,
}: EnrollmentStudentInfoProps) {
  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <Skeleton className="h-6 w-44" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </section>
    );
  }

  const fullName =
    studentProfile
      ? `${studentProfile.firstName} ${studentProfile.lastName}`.trim()
      : authUser?.name ?? "—";
  const email = studentProfile?.email ?? authUser?.email ?? "—";
  const phone = studentProfile?.phone ?? authUser?.phone ?? "—";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h3 className="text-base font-semibold text-slate-900">
        Student Information
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Your enrollment will be created using the details below.
      </p>

      {!studentProfile ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <p>
            {profileError
              ? "We could not load your student profile."
              : "Please complete your student profile before enrolling."}
          </p>
          <Link
            href="/student/profile"
            className="mt-3 inline-flex h-9 items-center justify-center rounded-lg border border-amber-300 bg-white px-4 text-sm font-medium text-slate-900 hover:bg-amber-50"
          >
            Complete Profile
          </Link>
        </div>
      ) : null}

      <dl className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Full Name
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{fullName}</dd>
        </div>

        <div>
          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Email
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{email}</dd>
        </div>

        <div className="sm:col-span-2">
          <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Phone Number
          </dt>
          <dd className="mt-1 text-sm font-medium text-slate-900">{phone}</dd>
        </div>
      </dl>
    </section>
  );
}
