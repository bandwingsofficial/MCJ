"use client";

import Link from "next/link";

import { branchOpsApi } from "@/src/features/branch-ops/api/branch-ops.api";
import { ListPageHeader } from "@/src/shared/components/ui/list-page-header";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Badge } from "@/src/shared/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/shared/components/ui/table";
import { useAsyncData } from "@/src/shared/hooks/use-async-data";
import { useAuthStore } from "@/src/features/auth/store/auth.store";
import { formatRoleLabel } from "@/src/core/auth/roles";

export default function InterviewsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.interviews(),
    [],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  const items = data ?? [];

  return (
    <div className="space-y-5">
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Interviews"
        title="Interviews"
        totalLabel="Total Interviews"
        total={items.length}
      />

      {!items.length ? (
        <EmptyState title="No interviews scheduled." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>When</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {new Date(item.scheduledAt).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/job-applications/${item.applicationId}`}
                    className="font-medium text-[#2563EB] hover:underline"
                  >
                    {item.application?.candidateName ??
                      item.application?.applicationNumber}
                  </Link>
                </TableCell>
                <TableCell>{item.job?.title}</TableCell>
                <TableCell>{item.mode}</TableCell>
                <TableCell>
                  <Badge>{item.status}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
