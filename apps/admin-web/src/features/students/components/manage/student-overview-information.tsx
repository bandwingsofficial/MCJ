"use client";

import Image from "next/image";

import { Card } from "@/src/shared/components/ui/card";

import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import {
  formatStudentName,
  getStudentInitials,
} from "@/src/features/students/utils/student-overview.utils";

interface Props {
  student: Student;
}

function OverviewSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 bg-[#F6F9FD] px-4 py-3">
        <h3 className="text-sm font-semibold text-[#102A56]">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-xs text-[#647A9B]">{description}</p>
        ) : null}
      </header>
      <dl className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function InfoField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-[#102A56]">{children}</dd>
    </div>
  );
}

function displayValue(value?: string | number | null) {
  if (value === undefined || value === null) {
    return "—";
  }

  if (typeof value === "string" && value.trim() === "") {
    return "—";
  }

  return value;
}

function formatGender(value?: Student["gender"]) {
  if (!value) {
    return "—";
  }

  return value.charAt(0) + value.slice(1).toLowerCase();
}

function hasText(value?: string | null) {
  return Boolean(value?.trim());
}

export function StudentOverviewInformation({ student }: Props) {
  const isArchived = Boolean(student.deletedAt || student.isDeleted);
  const fullName = formatStudentName(student.firstName, student.lastName);

  const hasEducation =
    hasText(student.qualification) ||
    hasText(student.collegeName) ||
    hasText(student.specialization) ||
    student.passingYear != null;

  const hasAddress =
    hasText(student.addressLine1) ||
    hasText(student.addressLine2) ||
    hasText(student.city) ||
    hasText(student.state) ||
    hasText(student.country) ||
    hasText(student.postalCode);

  const hasParent =
    hasText(student.parentName) || hasText(student.parentPhone);

  return (
    <Card className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-[#102A56]">
        Student Information
      </h2>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        {student.profileImageUrl ? (
          <Image
            src={student.profileImageUrl}
            alt={fullName}
            width={72}
            height={72}
            className="h-[72px] w-[72px] rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-violet-100 text-xl font-semibold text-violet-700">
            {getStudentInitials(student.firstName, student.lastName)}
          </div>
        )}

        <div className="min-w-0">
          <p className="text-lg font-semibold text-[#102A56]">{fullName}</p>
          <p className="mt-0.5 text-sm text-[#647A9B]">{student.studentCode}</p>
          <div className="mt-2">
            <StudentStatusBadge
              status={student.status}
              isActive={student.isActive}
              isDeleted={isArchived}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <OverviewSection
          title="Student Identity"
          description="Basic profile details and status."
        >
          <InfoField label="Student ID">{student.studentCode}</InfoField>
          <InfoField label="Status">
            <StudentStatusBadge
              status={student.status}
              isActive={student.isActive}
              isDeleted={isArchived}
            />
          </InfoField>
          <InfoField label="First Name">{student.firstName}</InfoField>
          <InfoField label="Last Name">{displayValue(student.lastName)}</InfoField>
          <InfoField label="Gender">{formatGender(student.gender)}</InfoField>
          <InfoField label="Date of Birth">
            {formatStudentDate(student.dateOfBirth)}
          </InfoField>
        </OverviewSection>

        {(hasText(student.email) || hasText(student.phone)) && (
          <OverviewSection
            title="Contact Information"
            description="Primary email and phone details."
          >
            {hasText(student.email) ? (
              <InfoField label="Email">{student.email}</InfoField>
            ) : null}
            {hasText(student.phone) ? (
              <InfoField label="Phone">{student.phone}</InfoField>
            ) : null}
          </OverviewSection>
        )}

        {hasEducation ? (
          <OverviewSection
            title="Education"
            description="Academic background and specialization."
          >
            {hasText(student.qualification) ? (
              <InfoField label="Qualification">
                {student.qualification}
              </InfoField>
            ) : null}
            {hasText(student.collegeName) ? (
              <InfoField label="College Name">{student.collegeName}</InfoField>
            ) : null}
            {hasText(student.specialization) ? (
              <InfoField label="Specialization">
                {student.specialization}
              </InfoField>
            ) : null}
            {student.passingYear != null ? (
              <InfoField label="Passing Year">{student.passingYear}</InfoField>
            ) : null}
          </OverviewSection>
        ) : null}

        {hasAddress ? (
          <OverviewSection
            title="Address"
            description="Residential address details."
          >
            {hasText(student.addressLine1) ? (
              <InfoField label="Address Line 1">
                {student.addressLine1}
              </InfoField>
            ) : null}
            {hasText(student.addressLine2) ? (
              <InfoField label="Address Line 2">
                {student.addressLine2}
              </InfoField>
            ) : null}
            {hasText(student.city) ? (
              <InfoField label="City">{student.city}</InfoField>
            ) : null}
            {hasText(student.state) ? (
              <InfoField label="State">{student.state}</InfoField>
            ) : null}
            {hasText(student.country) ? (
              <InfoField label="Country">{student.country}</InfoField>
            ) : null}
            {hasText(student.postalCode) ? (
              <InfoField label="Postal Code">{student.postalCode}</InfoField>
            ) : null}
          </OverviewSection>
        ) : null}

        {hasParent ? (
          <OverviewSection
            title="Parent / Guardian"
            description="Primary parent or guardian contact."
          >
            {hasText(student.parentName) ? (
              <InfoField label="Parent Name">{student.parentName}</InfoField>
            ) : null}
            {hasText(student.parentPhone) ? (
              <InfoField label="Parent Phone">{student.parentPhone}</InfoField>
            ) : null}
          </OverviewSection>
        ) : null}

        {hasText(student.notes) ? (
          <OverviewSection
            title="Additional Notes"
            description="Optional internal notes."
          >
            <InfoField label="Notes" className="sm:col-span-2">
              <span className="whitespace-pre-wrap">{student.notes}</span>
            </InfoField>
          </OverviewSection>
        ) : null}
      </div>
    </Card>
  );
}
