"use client";

import { useRouter } from "next/navigation";
import { Briefcase, MapPin, IndianRupee, Hourglass } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

interface JobCardProps {
  job: Job;
}

export function JobCard({
  job,
}: JobCardProps) {
  const router =
    useRouter();

  return (
    <Card className="flex h-full flex-col p-6 transition-shadow hover:shadow-lg">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">
            {job.title}
          </h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {job.companyName}
          </p>
        </div>

        <Badge variant="success">
          {job.status}
        </Badge>
      </div>

      <div className="mt-5 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>
            {job.city},{" "}
            {job.state}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>
            {job.employmentType.replaceAll(
              "_",
              " ",
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Hourglass className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>
            {job.minExperience}-
            {job.maxExperience} Years
          </span>
        </div>

        <div className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span>
            {job.minSalary.toLocaleString()}
            {" - "}
            {job.maxSalary.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="w-full"
          onClick={() =>
            router.push(
              `/jobs/${job.slug}`,
            )
          }
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}