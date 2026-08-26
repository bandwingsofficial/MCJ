"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";
import { batchService } from "@/src/features/batches/services/batch.service";
import { useBranches } from "@/src/features/branches/hooks/useBranches";
import { BranchCard } from "@/src/features/branches/components/branch-card";
import { isBatchSelectable } from "@/src/features/enrollments/utils/enrollment-batch.utils";

export function HomeBranchesSection() {
  const router = useRouter();
  const { branches, isLoading, error, refetch } = useBranches();
  const [offeringBranchIds, setOfferingBranchIds] = useState<Set<string>>();
  const [offeringsLoading, setOfferingsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const loadOfferings = async () => {
      try {
        setOfferingsLoading(true);
        const batches = await batchService.getAllBatches();
        if (cancelled) {
          return;
        }

        const ids = new Set(
          batches
            .filter(isBatchSelectable)
            .map((batch) => batch.branchId)
            .filter((branchId): branchId is string => Boolean(branchId)),
        );
        setOfferingBranchIds(ids);
      } catch {
        if (!cancelled) {
          setOfferingBranchIds(undefined);
        }
      } finally {
        if (!cancelled) {
          setOfferingsLoading(false);
        }
      }
    };

    void loadOfferings();

    return () => {
      cancelled = true;
    };
  }, []);

  const visibleBranches = useMemo(() => {
    const available = offeringBranchIds
      ? branches.filter((branch) => offeringBranchIds.has(branch.id))
      : branches;

    return available.slice(0, 3);
  }, [branches, offeringBranchIds]);

  const showLoading = isLoading || offeringsLoading;

  if (!showLoading && !error && visibleBranches.length === 0) {
    return null;
  }

  return (
    <section className="w-full bg-slate-50/60 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">
              Available Branches
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Learn at a location convenient for you.
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/branches")}>
            View All
          </Button>
        </div>

        {showLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-xl" />
            ))}
          </div>
        ) : null}

        {error ? (
          <ErrorState
            title="Unable to load branches"
            description="Please try again later."
            onRetry={refetch}
          />
        ) : null}

        {!showLoading && !error ? (
          <div className="grid gap-6 md:grid-cols-3">
            {visibleBranches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
