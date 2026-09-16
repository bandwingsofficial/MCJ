"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { batchService } from "@/src/features/batches/services/batch.service";
import { branchService } from "@/src/features/branches/services/branch.service";
import { getCourses } from "@/src/features/courses/services/course.service";
import { jobService } from "@/src/features/jobs/services/job.service";

function formatCount(value: number): string {
  if (value >= 1000) {
    return `${Math.floor(value / 100) / 10}k+`.replace(".0k+", "k+");
  }

  return `${value}+`;
}

export function useHomeStats() {
  const branchesQuery = useQuery({
    queryKey: ["home-stats", "branches"],
    queryFn: () => branchService.getBranches(),
    staleTime: 1000 * 60 * 10,
  });

  const coursesQuery = useQuery({
    queryKey: ["home-stats", "courses"],
    queryFn: () => getCourses(),
    staleTime: 1000 * 60 * 10,
  });

  const batchesQuery = useQuery({
    queryKey: ["home-stats", "batches"],
    queryFn: () => batchService.getAllBatches(),
    staleTime: 1000 * 60 * 10,
  });

  const jobsQuery = useQuery({
    queryKey: ["home-stats", "jobs"],
    queryFn: () => jobService.getJobs(),
    staleTime: 1000 * 60 * 10,
  });

  const stats = useMemo(() => {
    const branchCount = branchesQuery.data?.length ?? 0;
    const courseCount = coursesQuery.data?.length ?? 0;
    const batches = batchesQuery.data ?? [];
    const studentsTrained = batches.reduce(
      (total, batch) => total + (batch.enrolledCount ?? 0),
      0,
    );
    const jobsPayload = jobsQuery.data;
    const hiringPartners = Array.isArray(jobsPayload)
      ? jobsPayload.length
      : (jobsPayload as { items?: unknown[] } | undefined)?.items?.length ?? 0;

    return [
      {
        label: "Students Trained",
        value: studentsTrained > 0 ? formatCount(studentsTrained) : "—",
      },
      {
        label: "Branches",
        value: branchCount > 0 ? String(branchCount) : "—",
      },
      {
        label: "Active Courses",
        value: courseCount > 0 ? formatCount(courseCount) : "—",
      },
      {
        label: "Hiring Opportunities",
        value: hiringPartners > 0 ? formatCount(hiringPartners) : "—",
      },
    ];
  }, [
    branchesQuery.data,
    coursesQuery.data,
    batchesQuery.data,
    jobsQuery.data,
  ]);

  return {
    stats,
    isLoading:
      branchesQuery.isLoading ||
      coursesQuery.isLoading ||
      batchesQuery.isLoading ||
      jobsQuery.isLoading,
    isError:
      branchesQuery.isError &&
      coursesQuery.isError &&
      batchesQuery.isError,
  };
}
