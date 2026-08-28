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

export default function JobApplicationsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.jobApplications(),
    [],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  return (
    <div className="space-y-5">
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Job Applications"
        title="Job Applications"
        totalLabel="Total Applications"
        total={data?.total ?? data?.items.length ?? 0}
      />

      {!data?.items.length ? (
        <EmptyState title="No job applications found." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Applied</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Interview</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <Link
                    href={`/job-applications/${item.id}`}
                    className="font-medium text-indigo-700 hover:underline"
                  >
                    {item.applicationNumber}
                  </Link>
                </TableCell>
                <TableCell>{item.applicantName ?? "—"}</TableCell>
                <TableCell>{item.job?.title}</TableCell>
                <TableCell>{item.job?.companyName}</TableCell>
                <TableCell>{item.createdAt?.toString().slice(0, 10)}</TableCell>
                <TableCell>
                  <Badge variant="info">{item.status}</Badge>
                </TableCell>
                <TableCell>{item.interviewStatus ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
