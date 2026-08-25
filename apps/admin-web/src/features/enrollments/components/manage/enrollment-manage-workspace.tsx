"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import { EnrollmentManageAttendancePanel } from "@/src/features/enrollments/components/manage/enrollment-manage-attendance-panel";
import { EnrollmentManageBatchPanel } from "@/src/features/enrollments/components/manage/enrollment-manage-batch-panel";
import { EnrollmentManageCoursePanel } from "@/src/features/enrollments/components/manage/enrollment-manage-course-panel";
import { EnrollmentManageOverviewPanel } from "@/src/features/enrollments/components/manage/enrollment-manage-overview-panel";
import { EnrollmentManagePaymentsPanel } from "@/src/features/enrollments/components/manage/enrollment-manage-payments-panel";
import { EnrollmentManageProgressPanel } from "@/src/features/enrollments/components/manage/enrollment-manage-progress-panel";
import { EnrollmentManageStudentPanel } from "@/src/features/enrollments/components/manage/enrollment-manage-student-panel";
import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import {
  ENROLLMENT_MANAGE_DEFAULT_TAB,
  type EnrollmentManageTabKey,
} from "@/src/features/enrollments/utils/enrollment-manage.routes";

interface Props {
  enrollment: Enrollment;
  activeTab?: EnrollmentManageTabKey;
  onTabChange?: (tab: EnrollmentManageTabKey) => void;
  onEnrollmentRefresh?: () => Promise<void>;
}

const TAB_ITEMS: ReadonlyArray<[EnrollmentManageTabKey, string]> = [
  ["overview", "Overview"],
  ["student", "Student"],
  ["course", "Course"],
  ["batch", "Batch"],
  ["payments", "Payments"],
  ["attendance", "Attendance"],
  ["progress", "Progress"],
];

export function EnrollmentManageWorkspace({
  enrollment,
  activeTab = ENROLLMENT_MANAGE_DEFAULT_TAB,
  onTabChange,
  onEnrollmentRefresh,
}: Props) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        onTabChange?.(value as EnrollmentManageTabKey);
      }}
    >
      <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
        {TAB_ITEMS.map(([value, label]) => (
          <TabsTrigger
            key={value}
            value={value}
            className="rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2447A8] data-[state=active]:bg-transparent data-[state=active]:text-[#2447A8] data-[state=active]:shadow-none"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">
        <EnrollmentManageOverviewPanel enrollment={enrollment} />
      </TabsContent>
      <TabsContent value="student">
        <EnrollmentManageStudentPanel enrollment={enrollment} />
      </TabsContent>
      <TabsContent value="course">
        <EnrollmentManageCoursePanel enrollment={enrollment} />
      </TabsContent>
      <TabsContent value="batch">
        <EnrollmentManageBatchPanel enrollment={enrollment} />
      </TabsContent>
      <TabsContent value="payments">
        <EnrollmentManagePaymentsPanel
          enrollment={enrollment}
          onEnrollmentRefresh={onEnrollmentRefresh}
        />
      </TabsContent>
      <TabsContent value="attendance">
        <EnrollmentManageAttendancePanel enrollment={enrollment} />
      </TabsContent>
      <TabsContent value="progress">
        <EnrollmentManageProgressPanel enrollment={enrollment} />
      </TabsContent>
    </Tabs>
  );
}
