"use client";

import Image from "next/image";
import {
  Calendar,
  GraduationCap,
  Hash,
  Mail,
  MapPin,
  Phone,
  User,
  Users,
} from "lucide-react";

import { StudentStatusBadge } from "@/src/features/students/components/StudentStatusBadge";
import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";
import {
  formatStudentName,
  getStudentInitials,
} from "@/src/features/students/utils/student-overview.utils";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  student: Student;
}

function InfoBlock({
  label,
  value,
  icon: Icon,
  iconClass,
  bgClass,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon: typeof User;
  iconClass: string;
  bgClass: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E8F0FA] bg-white p-3 shadow-[0_1px_4px_rgba(16,42,86,0.04)]",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            bgClass,
          )}
        >
          <Icon className={cn("h-4 w-4", iconClass)} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#647A9B]">
            {label}
          </p>
          <div className="mt-1 text-sm font-medium text-[#102A56]">{value}</div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
      <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
        <h3 className="text-base font-semibold text-[#102A56]">{title}</h3>
        {description ? (
          <p className="mt-0.5 text-sm text-[#647A9B]">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-2">{children}</div>
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

  const addressParts = [
    student.addressLine1,
    student.addressLine2,
    student.city,
    student.state,
    student.country,
    student.postalCode,
  ].filter(hasText);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
        <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
          <h2 className="text-base font-semibold text-[#102A56]">
            Student Information
          </h2>
          <p className="mt-0.5 text-sm text-[#647A9B]">
            Core profile details and contact information.
          </p>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          {student.profileImageUrl ? (
            <Image
              src={student.profileImageUrl}
              alt={fullName}
              width={72}
              height={72}
              className="h-[72px] w-[72px] shrink-0 rounded-xl border border-[#DCE8F5] object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-xl border border-dashed border-[#DCE8F5] bg-gradient-to-br from-violet-50 to-[#F8FBFF] text-lg font-semibold text-violet-700">
              {getStudentInitials(student.firstName, student.lastName)}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-[#102A56]">{fullName}</p>
            <p className="mt-0.5 font-mono text-sm text-[#647A9B]">
              {student.studentCode}
            </p>
            <div className="mt-2">
              <StudentStatusBadge
                status={student.status}
                isActive={student.isActive}
                isDeleted={isArchived}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-[#E8F0FA] p-4 sm:grid-cols-2 xl:grid-cols-3">
          <InfoBlock
            label="Student ID"
            value={
              <span className="font-mono">{student.studentCode}</span>
            }
            icon={Hash}
            iconClass="text-violet-600"
            bgClass="bg-violet-50"
          />
          <InfoBlock
            label="First Name"
            value={student.firstName}
            icon={User}
            iconClass="text-[#2563EB]"
            bgClass="bg-blue-50"
          />
          <InfoBlock
            label="Last Name"
            value={displayValue(student.lastName)}
            icon={User}
            iconClass="text-sky-600"
            bgClass="bg-sky-50"
          />
          <InfoBlock
            label="Gender"
            value={formatGender(student.gender)}
            icon={User}
            iconClass="text-emerald-600"
            bgClass="bg-emerald-50"
          />
          <InfoBlock
            label="Date of Birth"
            value={formatStudentDate(student.dateOfBirth)}
            icon={Calendar}
            iconClass="text-amber-600"
            bgClass="bg-amber-50"
          />
          <InfoBlock
            label="Status"
            value={
              <StudentStatusBadge
                status={student.status}
                isActive={student.isActive}
                isDeleted={isArchived}
              />
            }
            icon={User}
            iconClass="text-[#2563EB]"
            bgClass="bg-blue-50"
          />
          {hasText(student.email) ? (
            <InfoBlock
              label="Email"
              value={student.email}
              icon={Mail}
              iconClass="text-rose-600"
              bgClass="bg-rose-50"
            />
          ) : null}
          {hasText(student.phone) ? (
            <InfoBlock
              label="Phone"
              value={student.phone}
              icon={Phone}
              iconClass="text-orange-600"
              bgClass="bg-orange-50"
            />
          ) : null}
        </div>
      </div>

      {hasEducation ? (
        <SectionCard
          title="Education"
          description="Academic background and specialization."
        >
          {hasText(student.qualification) ? (
            <InfoBlock
              label="Qualification"
              value={student.qualification}
              icon={GraduationCap}
              iconClass="text-emerald-600"
              bgClass="bg-emerald-50"
            />
          ) : null}
          {hasText(student.collegeName) ? (
            <InfoBlock
              label="College Name"
              value={student.collegeName}
              icon={GraduationCap}
              iconClass="text-[#2563EB]"
              bgClass="bg-blue-50"
            />
          ) : null}
          {hasText(student.specialization) ? (
            <InfoBlock
              label="Specialization"
              value={student.specialization}
              icon={GraduationCap}
              iconClass="text-violet-600"
              bgClass="bg-violet-50"
            />
          ) : null}
          {student.passingYear != null ? (
            <InfoBlock
              label="Passing Year"
              value={student.passingYear}
              icon={Calendar}
              iconClass="text-amber-600"
              bgClass="bg-amber-50"
            />
          ) : null}
        </SectionCard>
      ) : null}

      {hasAddress ? (
        <SectionCard title="Address" description="Residential address details.">
          <InfoBlock
            label="Full Address"
            value={addressParts.join(", ")}
            icon={MapPin}
            iconClass="text-sky-600"
            bgClass="bg-sky-50"
            className="sm:col-span-2"
          />
        </SectionCard>
      ) : null}

      {hasParent ? (
        <SectionCard
          title="Parent / Guardian"
          description="Primary parent or guardian contact."
        >
          {hasText(student.parentName) ? (
            <InfoBlock
              label="Parent Name"
              value={student.parentName}
              icon={Users}
              iconClass="text-[#2563EB]"
              bgClass="bg-blue-50"
            />
          ) : null}
          {hasText(student.parentPhone) ? (
            <InfoBlock
              label="Parent Phone"
              value={student.parentPhone}
              icon={Phone}
              iconClass="text-orange-600"
              bgClass="bg-orange-50"
            />
          ) : null}
        </SectionCard>
      ) : null}

      {hasText(student.notes) ? (
        <div className="overflow-hidden rounded-xl border border-[#E1EBF5] bg-white shadow-sm">
          <div className="border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-4 py-3">
            <h3 className="text-base font-semibold text-[#102A56]">
              Additional Notes
            </h3>
            <p className="mt-0.5 text-sm text-[#647A9B]">Optional internal notes.</p>
          </div>
          <div className="px-4 py-4">
            <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {student.notes}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
