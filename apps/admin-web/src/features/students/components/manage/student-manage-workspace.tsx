"use client";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { Student } from "@/src/features/students/types/student.types";
import { STUDENT_MANAGE_DEFAULT_TAB } from "@/src/features/students/utils/student-manage.routes";

import { StudentManageActivityPanel } from "./student-manage-activity-panel";
import { StudentManageAttendancePanel } from "./student-manage-attendance-panel";
import { StudentManageDocumentsPanel } from "./student-manage-documents-panel";
import { StudentManageOverviewPanel } from "./student-manage-overview-panel";
import { StudentManagePaymentsPanel } from "./student-manage-payments-panel";

interface Props {
  student: Student;
  activeTab?: TabKey;
  overviewRefreshKey?: number;
  onTabChange?: (tab: TabKey) => void;
  onStudentRefresh?: () => Promise<void>;
}

export type TabKey =
  | "overview"
  | "attendance"
  | "payments"
  | "documents"
  | "activity";

const TAB_ITEMS: ReadonlyArray<[TabKey, string]> = [
  ["overview", "Overview"],
  ["attendance", "Attendance"],
  ["payments", "Payments"],
  ["documents", "Documents"],
  ["activity", "Activity"],
];

export function StudentManageWorkspace({
  student,
  activeTab = STUDENT_MANAGE_DEFAULT_TAB,
  overviewRefreshKey = 0,
  onTabChange,
  onStudentRefresh,
}: Props) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        onTabChange?.(value as TabKey);
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
        <StudentManageOverviewPanel
          student={student}
          refreshKey={overviewRefreshKey}
          onNavigateToTab={(tab) => onTabChange?.(tab)}
          onStudentRefresh={onStudentRefresh}
        />
      </TabsContent>

      <TabsContent value="attendance">
        <StudentManageAttendancePanel
          student={student}
          refreshKey={overviewRefreshKey}
        />
      </TabsContent>

      <TabsContent value="payments">
        <StudentManagePaymentsPanel
          student={student}
          refreshKey={overviewRefreshKey}
        />
      </TabsContent>

      <TabsContent value="documents">
        <StudentManageDocumentsPanel student={student} />
      </TabsContent>

      <TabsContent value="activity">
        <StudentManageActivityPanel student={student} />
      </TabsContent>
    </Tabs>
  );
}
