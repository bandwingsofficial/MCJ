"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Label } from "@/src/shared/components/ui/label";
import { Separator } from "@/src/shared/components/ui/separator";

import { PlacementSalary } from "@/src/features/placement/components/PlacementSalary";
import { PlacementStatusBadge } from "@/src/features/placement/components/PlacementStatusBadge";
import { formatDate } from "@/src/features/placement/utils/format-date";

import type {
  Placement,
} from "@/src/features/placement/types/placement.types";

interface PlacementCardProps {
  placement: Placement;
}

export function PlacementCard({
  placement,
}: PlacementCardProps) {
  return (
    <Card className="space-y-8 p-6">
      <section className="space-y-5">
        <h2 className="text-2xl font-semibold">
          Placement Details
        </h2>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>
              Company
            </Label>

            <p className="mt-1 font-medium">
              {placement.companyName}
            </p>
          </div>

          <div>
            <Label>
              Designation
            </Label>

            <p className="mt-1 font-medium">
              {placement.designation}
            </p>
          </div>

          <div>
            <Label>
              Salary Package
            </Label>

            <div className="mt-1">
              <PlacementSalary
                salary={
                  placement.salary
                }
              />
            </div>
          </div>

          <div>
            <Label>
              Status
            </Label>

            <div className="mt-2">
              <PlacementStatusBadge
                status={
                  placement.status
                }
              />
            </div>
          </div>

          <div>
            <Label>
              Joining Date
            </Label>

            <p className="mt-1 font-medium">
              {formatDate(
                placement.joiningDate,
              )}
            </p>
          </div>

          <div>
            <Label>
              Remarks
            </Label>

            <p className="mt-1 font-medium">
              {placement.remarks ??
                "No remarks available"}
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-5">
        <h3 className="text-lg font-semibold">
          Job Information
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>
              Job Title
            </Label>

            <p className="mt-1 font-medium">
              {placement.job
                ?.title ?? "-"}
            </p>
          </div>

          <div>
            <Label>
              Company
            </Label>

            <p className="mt-1 font-medium">
              {placement.job
                ?.companyName ??
                "-"}
            </p>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-5">
        <h3 className="text-lg font-semibold">
          Student Information
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <Label>
              Student Name
            </Label>

            <p className="mt-1 font-medium">
              {placement.student
                ? `${placement.student.firstName} ${placement.student.lastName}`
                : "-"}
            </p>
          </div>

          <div>
            <Label>
              Student Code
            </Label>

            <p className="mt-1 font-medium">
              {placement.student
                ?.studentCode ??
                "-"}
            </p>
          </div>
        </div>
      </section>
    </Card>
  );
}