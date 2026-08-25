"use client";

import Link from "next/link";

import { PageHeader } from "@/src/shared/components/ui/page-header";
import { Card } from "@/src/shared/components/ui/card";

import { CreateEnrollmentForm } from "../components/form/CreateEnrollmentForm";

export function CreateEnrollmentPage() {
  return (
    <>
      <PageHeader
        title="Create Enrollment"
        description="Select branch, batch, and student, then record payment to enroll immediately."
        actions={
          <Link
            href="/enrollments"
            className="inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Back to Enrollments
          </Link>
        }
      />

      <Card className="mt-4 p-6">
        <CreateEnrollmentForm />
      </Card>
    </>
  );
}
