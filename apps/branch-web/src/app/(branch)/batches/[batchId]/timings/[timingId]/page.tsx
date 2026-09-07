"use client";

import { use, useEffect } from "react";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import {
  BatchTimingManageHeader,
  BatchTimingOverviewPanel,
} from "@/src/features/branch-ops/components/batches/batch-timing-manage-panels";
import { BatchTimingStudentsPanel } from "@/src/features/branch-ops/components/batches/batch-timing-students-panel";
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
  params: Promise<{ batchId: string; timingId: string }>;
}

const TAB_CLASS =
  "rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium text-slate-500 shadow-none data-[state=active]:border-[#2563EB] data-[state=active]:bg-transparent data-[state=active]:text-[#2563EB] data-[state=active]:shadow-none";

export default function BatchTimingManagePage({ params }: PageProps) {
  const { batchId, timingId } = use(params);
  const role = useAuthStore((state) => state.user?.role);
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.batch(batchId),
    [batchId],
  );

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState === "hidden") return;
      void reload({ silent: true });
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [reload]);

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;
  if (!data) return <EmptyState title="Batch not found." />;

  const timing = data.timings?.find((item) => item.id === timingId);
  if (!timing) {
    return <EmptyState title="Batch timing not found for this batch." />;
  }

  return (
    <div className="space-y-5">
      <BatchTimingManageHeader
        batch={data}
        timing={timing}
        parentLabel={formatRoleLabel(role) || "Branch"}
      />

      <Tabs defaultValue="overview">
        <TabsList className="mb-3 flex h-auto w-full flex-wrap justify-start gap-0.5 rounded-none border-b border-slate-200 bg-transparent p-0">
          <TabsTrigger value="overview" className={TAB_CLASS}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="students" className={TAB_CLASS}>
            Students
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <BatchTimingOverviewPanel batch={data} timing={timing} />
        </TabsContent>
        <TabsContent value="students">
          <BatchTimingStudentsPanel batchId={batchId} timingId={timingId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
