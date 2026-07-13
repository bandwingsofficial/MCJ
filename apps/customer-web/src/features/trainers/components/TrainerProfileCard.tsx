"use client";

import Image from "next/image";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

interface TrainerProfileCardProps {
  trainer: Trainer;
}

export function TrainerProfileCard({
  trainer,
}: TrainerProfileCardProps) {
  const fullName = `${trainer.firstName} ${trainer.lastName}`;

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-full border bg-muted">
          {trainer.profileImageUrl ? (
            <Image
              src={trainer.profileImageUrl}
              alt={fullName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl font-bold text-muted-foreground">
              {trainer.firstName.charAt(0)}
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold">
          {fullName}
        </h2>

        <p className="mt-1 text-sm text-muted-foreground">
          {trainer.specialization ??
            "Trainer"}
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Badge>
            {trainer.trainerType}
          </Badge>

          <Badge
            variant={
              trainer.status ===
              "ACTIVE"
                ? "success"
                : "danger"
            }
          >
            {trainer.status}
          </Badge>

          {trainer.isFeatured && (
            <Badge variant="warning">
              Featured
            </Badge>
          )}
        </div>

        <div className="mt-6 w-full space-y-4 border-t pt-6 text-left">
          <ProfileItem
            label="Employee Code"
            value={trainer.employeeCode}
          />

          <ProfileItem
            label="Qualification"
            value={
              trainer.qualification ??
              "-"
            }
          />

          <ProfileItem
            label="Experience"
            value={`${trainer.experienceYears} Years`}
          />

          <ProfileItem
            label="Branch"
            value={
              trainer.branch
                ?.branchName ?? "-"
            }
          />

          <ProfileItem
            label="Rating"
            value={`${trainer.averageRating} ⭐`}
          />

          <ProfileItem
            label="Reviews"
            value={`${trainer.totalReviews}`}
          />
        </div>
      </div>
    </Card>
  );
}

interface ProfileItemProps {
  label: string;
  value: string;
}

function ProfileItem({
  label,
  value,
}: ProfileItemProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-sm font-medium text-right">
        {value}
      </span>
    </div>
  );
}