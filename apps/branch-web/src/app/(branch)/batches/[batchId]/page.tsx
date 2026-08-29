"use client";

import { use } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { BatchCoursePanel } from "@/src/features/branch-ops/components/batches/batch-course-panel";
import { BatchManageHeader } from "@/src/features/branch-ops/components/batches/batch-manage-header";
import { BatchOverviewPanel } from "@/src/features/branch-ops/components/batches/batch-overview-panel";
import { BatchStudentsPanel } from "@/src/features/branch-ops/components/batches/batch-students-panel";
import { formatRoleLabel } from "@/src/core/auth/roles";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/src/shared/components/ui/tabs";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";

interface PageProps {
  params: Promise<{ batchId: string }>;
}

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

export default function BatchManagePage({ params }: PageProps) {
  const { batchId } = use(params);
  const role = useAuthStore((state) => state.user?.role);
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batch(batchId),
    [batchId],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <EmptyState title="Batch not found." />;

  return (
    <div className="space-y-5">
      <BatchManageHeader
        batch={data}
        parentLabel={formatRoleLabel(role) || "Branch"}
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger value="overview" className={TAB_CLASS}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="course" className={TAB_CLASS}>
            Course
          </TabsTrigger>
          <TabsTrigger value="students" className={TAB_CLASS}>
            Enrolled Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <BatchOverviewPanel batch={data} />
        </TabsContent>
        <TabsContent value="course">
          <BatchCoursePanel batchId={batchId} />
        </TabsContent>
        <TabsContent value="students">
          <BatchStudentsPanel
            batchId={batchId}
            onStudentsChanged={() => {
              void reload();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
