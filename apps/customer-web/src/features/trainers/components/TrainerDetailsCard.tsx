"use client";

import Image from "next/image";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

interface TrainerDetailsCardProps {
  trainer: Trainer;
}

export function TrainerDetailsCard({
  trainer,
}: TrainerDetailsCardProps) {
  const fullName = `${trainer.firstName} ${trainer.lastName}`;

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-8 p-6 lg:flex-row">
        <div className="flex justify-center lg:w-72">
          <div className="relative h-64 w-64 overflow-hidden rounded-xl border bg-muted">
            {trainer.profileImageUrl ? (
              <Image
                src={trainer.profileImageUrl}
                alt={fullName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-6xl font-bold text-muted-foreground">
                {trainer.firstName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-3xl font-bold">
              {fullName}
            </h2>

            {trainer.isFeatured && (
              <Badge variant="success">
                Featured
              </Badge>
            )}

            <Badge>
              {trainer.status}
            </Badge>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <InfoItem
              label="Employee Code"
              value={trainer.employeeCode}
            />

            <InfoItem
              label="Trainer Type"
              value={trainer.trainerType}
            />

            <InfoItem
              label="Qualification"
              value={
                trainer.qualification ??
                "-"
              }
            />

            <InfoItem
              label="Experience"
              value={`${trainer.experienceYears} Years`}
            />

            <InfoItem
              label="Specialization"
              value={
                trainer.specialization ??
                "-"
              }
            />

            <InfoItem
              label="Branch"
              value={
                trainer.branch
                  ?.branchName ?? "-"
              }
            />

            <InfoItem
              label="Rating"
              value={`${trainer.averageRating} ⭐`}
            />

            <InfoItem
              label="Reviews"
              value={`${trainer.totalReviews}`}
            />

            <InfoItem
              label="Joined On"
              value={new Date(
                trainer.joinedAt,
              ).toLocaleDateString()}
            />

            <InfoItem
              label="Gender"
              value={trainer.gender}
            />
          </div>

          <Separator />

          <div>
            <h3 className="mb-2 text-lg font-semibold">
              Bio
            </h3>

            <p className="leading-7 text-muted-foreground">
              {trainer.bio ??
                "No bio available."}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface InfoItemProps {
  label: string;
  value: string;
}

function InfoItem({
  label,
  value,
}: InfoItemProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">
        {label}
      </p>

      <p className="font-medium">
        {value}
      </p>
    </div>
  );
}