"use client";

import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  CalendarDays,
  ClipboardList,
  CreditCard,
  GraduationCap,
  LayoutDashboard,
  Layers,
  User,
} from "lucide-react";

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

const TAB_CLASS =
  "inline-flex items-center rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const TAB_ITEMS: ReadonlyArray<{
  value: EnrollmentManageTabKey;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "student", label: "Student", icon: User },
  { value: "course", label: "Course", icon: BookOpen },
  { value: "batch", label: "Batch", icon: Layers },
  { value: "payments", label: "Payments", icon: CreditCard },
  { value: "attendance", label: "Attendance", icon: CalendarDays },
  { value: "progress", label: "Progress", icon: ClipboardList },
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
        {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className={TAB_CLASS}>
            <Icon className="mr-1.5 h-4 w-4 shrink-0" aria-hidden="true" />
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
