"use client";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import { Card } from "@/src/shared/components/ui/card";

import { EnrollmentForm } from "../components/form";

export function CreateEnrollmentPage() {
  return (
    <>
      <PageHeader
        title="Create Enrollment"
        description="Create a new student enrollment."
      />

      <Card className="mt-4 p-6">
        <EnrollmentForm
          mode="create"
        />
      </Card>
    </>
  );
}