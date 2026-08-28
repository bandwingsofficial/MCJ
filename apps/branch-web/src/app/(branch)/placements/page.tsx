"use client";

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

export default function PlacementsPage() {
  const role = useAuthStore((state) => state.user?.role);
  const { data, loading, error, reload } = useAsyncData(
    () => branchOpsApi.placementActivity(),
    [],
  );

  if (loading) return <Loader />;
  if (error) return <ErrorState description={error} onRetry={reload} />;

  const items = data ?? [];

  return (
    <div className="space-y-5">
      <ListPageHeader
        parentLabel={formatRoleLabel(role) || "Branch"}
        currentLabel="Placement Activities"
        title="Placement Activities"
        totalLabel="Total Records"
        total={items.length}
      />

      {!items.length ? (
        <EmptyState title="No placement activity yet." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Application</TableHead>
              <TableHead>Candidate</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Application</TableHead>
              <TableHead>Interview</TableHead>
              <TableHead>Placement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.applicationNumber}</TableCell>
                <TableCell>{item.candidateName ?? "—"}</TableCell>
                <TableCell>{item.jobTitle}</TableCell>
                <TableCell>{item.companyName}</TableCell>
                <TableCell>
                  <Badge variant="info">{item.status}</Badge>
                </TableCell>
                <TableCell>{item.interviewStatus ?? "—"}</TableCell>
                <TableCell>{item.placementStatus ?? "—"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
