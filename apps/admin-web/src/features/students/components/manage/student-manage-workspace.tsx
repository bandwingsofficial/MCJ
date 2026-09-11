"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ClipboardList,
  FileText,
  LayoutDashboard,
} from "lucide-react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";

import type { Student } from "@/src/features/students/types/student.types";
import { STUDENT_MANAGE_DEFAULT_TAB } from "@/src/features/students/utils/student-manage.routes";

import { StudentManageActivityPanel } from "./student-manage-activity-panel";
import { StudentManageDocumentsPanel } from "./student-manage-documents-panel";
import { StudentManageOverviewPanel } from "./student-manage-overview-panel";
import { StudentManageJobApplicationsPanel } from "./student-manage-job-applications-panel";

interface Props {
  student: Student;
  activeTab?: TabKey;
  overviewRefreshKey?: number;
  onTabChange?: (tab: TabKey) => void;
  onDocumentsChanged?: () => void;
}

export type TabKey = "overview" | "documents" | "job-applications" | "activity";

const TAB_CLASS =
  "inline-flex items-center rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

const TAB_ITEMS: ReadonlyArray<{
  value: TabKey;
  label: string;
  icon: LucideIcon;
}> = [
  { value: "overview", label: "Overview", icon: LayoutDashboard },
  { value: "documents", label: "Documents", icon: FileText },
  { value: "job-applications", label: "Job Applications", icon: ClipboardList },
  { value: "activity", label: "Activity", icon: Activity },
];

export function StudentManageWorkspace({
  student,
  activeTab = STUDENT_MANAGE_DEFAULT_TAB,
  overviewRefreshKey = 0,
  onTabChange,
  onDocumentsChanged,
}: Props) {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        onTabChange?.(value as TabKey);
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
        <StudentManageOverviewPanel
          student={student}
          refreshKey={overviewRefreshKey}
          onNavigateToTab={(tab) => onTabChange?.(tab)}
        />
      </TabsContent>

      <TabsContent value="documents">
        <StudentManageDocumentsPanel
          student={student}
          refreshKey={overviewRefreshKey}
          onDocumentsChanged={onDocumentsChanged}
        />
      </TabsContent>

      <TabsContent value="job-applications">
        <StudentManageJobApplicationsPanel student={student} />
      </TabsContent>

      <TabsContent value="activity">
        <StudentManageActivityPanel student={student} />
      </TabsContent>
    </Tabs>
  );
}
