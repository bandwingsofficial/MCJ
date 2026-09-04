"use client";

import Link from "next/link";
import { LogIn, UserPlus } from "lucide-react";

interface EnrollmentAuthRequiredProps {
  loginHref: string;
  registerHref: string;
  variant?: "card" | "inline";
}

export function EnrollmentAuthRequired({
  loginHref,
  registerHref,
  variant = "card",
}: EnrollmentAuthRequiredProps) {
  if (variant === "inline") {
    return (
      <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Create an account or sign in to continue
        </h3>
        <p className="mt-1 text-sm text-slate-600">
          Review your selections below, then sign in when you are ready to
          complete payment.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Link
            href={loginHref}
            className="inline-flex h-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#2563D9] to-[#1746A2] px-5 text-sm font-semibold text-white hover:from-[#1E58C7] hover:to-[#123D94]"
          >
            <LogIn className="mr-2 h-4 w-4" />
            Sign In
          </Link>

          <Link
            href={registerHref}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Create Account
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#2563D9]">
        <LogIn className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-xl font-semibold text-slate-900">
        Sign in to continue
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">
        Please sign in or create an account before completing your enrollment.
      </p>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={loginHref}
          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-[#2563D9] to-[#1746A2] px-6 text-sm font-semibold text-white hover:from-[#1E58C7] hover:to-[#123D94]"
        >
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Link>

        <Link
          href={registerHref}
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900 hover:bg-slate-50"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Create Account
        </Link>
      </div>
    </div>
  );
}
