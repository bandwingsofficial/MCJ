"use client";

import { useState } from "react";

import { Card } from "@/src/shared/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { Student } from "@/src/features/students/types/student.types";
import { formatStudentDate } from "@/src/features/students/utils/student-form.utils";

interface Props {
  student: Student;
  onTabChange?: (tab: TabKey) => void;
}

export type TabKey = "overview" | "enrollments" | "attendance" | "reports";

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-medium text-slate-900 break-words">
        {value ?? "—"}
      </p>
    </div>
  );
}

export function StudentManageWorkspace({ student, onTabChange }: Props) {
  const [tab, setTab] = useState<TabKey>("overview");
  const fullName = [student.firstName, student.lastName].filter(Boolean).join(" ");

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        const nextTab = value as TabKey;
        setTab(nextTab);
        onTabChange?.(nextTab);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {(
          [
            ["overview", "Overview"],
            ["enrollments", "Enrollments"],
            ["attendance", "Attendance"],
            ["reports", "Reports"],
          ] as const
        ).map(([value, label]) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2447A8] data-[state=active]:bg-transparent data-[state=active]:text-[#2447A8] data-[state=active]:shadow-none"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="space-y-3">
        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Personal Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Full Name" value={fullName} />
            <DetailItem label="Student Code" value={student.studentCode} />
            <DetailItem label="Email" value={student.email} />
            <DetailItem label="Phone" value={student.phone} />
            <DetailItem label="Gender" value={student.gender} />
            <DetailItem
              label="Date of Birth"
              value={formatStudentDate(student.dateOfBirth)}
            />
            <DetailItem
              label="Branch"
              value={student.branchId}
            />
            <DetailItem
              label="Admission Date"
              value={formatStudentDate(student.admissionDate)}
            />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Academic Information
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Qualification" value={student.qualification} />
            <DetailItem label="College" value={student.collegeName} />
            <DetailItem label="Specialization" value={student.specialization} />
            <DetailItem label="Passing Year" value={student.passingYear} />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Address
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Address Line 1" value={student.addressLine1} />
            <DetailItem label="Address Line 2" value={student.addressLine2} />
            <DetailItem label="City" value={student.city} />
            <DetailItem label="State" value={student.state} />
            <DetailItem label="Country" value={student.country} />
            <DetailItem label="Postal Code" value={student.postalCode} />
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">
            Family & Emergency
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem label="Parent Name" value={student.parentName} />
            <DetailItem label="Parent Phone" value={student.parentPhone} />
            <DetailItem
              label="Emergency Contact"
              value={student.emergencyContactName}
            />
            <DetailItem
              label="Emergency Phone"
              value={student.emergencyContactPhone}
            />
          </div>
        </Card>

        {student.notes ? (
          <Card className="p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Notes</h2>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {student.notes}
            </p>
          </Card>
        ) : null}
      </TabsContent>

      <TabsContent value="enrollments">
        <Card className="p-6">
          <p className="text-sm text-slate-500">
            Enrollment management for this student will appear here.
          </p>
        </Card>
      </TabsContent>

      <TabsContent value="attendance">
        <Card className="p-6">
          <p className="text-sm text-slate-500">
            Attendance records for this student will appear here.
          </p>
        </Card>
      </TabsContent>

      <TabsContent value="reports">
        <Card className="p-6">
          <p className="text-sm text-slate-500">
            Reports for this student will appear here.
          </p>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
