"use client";

import { useRouter } from "next/navigation";
import { Briefcase, MapPin, IndianRupee, Hourglass } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type { Job } from "@/src/features/jobs/types/job.types";

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();

  return (
    <Card className="group flex h-full flex-col justify-between border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md rounded-2xl max-w-sm">
      <div>
        {/* Header Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-slate-500">
              {job.companyName}
            </p>
          </div>
          <Badge 
            variant="success" 
            className="capitalize px-2.5 py-1 text-xs font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full shrink-0"
          >
            {job.status.toLowerCase()}
          </Badge>
        </div>

        {/* Decorative Divider */}
        <div className="my-5 border-t border-slate-100" />

        {/* Job Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
              <MapPin className="h-4 w-4 shrink-0" />
            </div>
            <span className="truncate font-medium">
              {job.city}, {job.state}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
              <Briefcase className="h-4 w-4 shrink-0" />
            </div>
            <span className="truncate font-medium capitalize">
              {job.employmentType.replaceAll("_", " ").toLowerCase()}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
              <Hourglass className="h-4 w-4 shrink-0" />
            </div>
            <span className="font-medium">
              {job.minExperience} - {job.maxExperience} Years
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-50 rounded-lg text-slate-400">
              <IndianRupee className="h-4 w-4 shrink-0" />
            </div>
            <span className="font-semibold text-slate-800">
              ₹{job.minSalary.toLocaleString()} - {job.maxSalary.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 pt-2">
        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-5 shadow-sm hover:shadow transition-all duration-200 rounded-xl"
          onClick={() => router.push(`/jobs/${job.slug}`)}
        >
          View Details
        </Button>
      </div>
    </Card>
  );
}