"use client";

import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import type {
  Trainer,
} from "@/src/features/trainers/types/trainer.types";

interface TrainerCardProps {
  trainer: Trainer;
}

export function TrainerCard({
  trainer,
}: TrainerCardProps) {
  const fullName = `${trainer.firstName} ${trainer.lastName}`;

  return (
    <Link
      href={`/trainers/${trainer.id}`}
      className="block"
    >
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <div className="relative h-64 w-full bg-muted">
          {trainer.profileImageUrl ? (
            <Image
              src={
                trainer.profileImageUrl
              }
              alt={fullName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-5xl font-bold text-muted-foreground">
              {trainer.firstName.charAt(0)}
            </div>
          )}

          {trainer.isFeatured && (
            <Badge className="absolute left-3 top-3">
              Featured
            </Badge>
          )}
        </div>

        <div className="space-y-3 p-5">
          <div>
            <h3 className="text-lg font-semibold">
              {fullName}
            </h3>

            <p className="text-sm text-muted-foreground">
              {trainer.specialization ??
                "Trainer"}
            </p>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>
              <span className="font-medium text-foreground">
                Qualification:
              </span>{" "}
              {trainer.qualification ??
                "-"}
            </p>

            <p>
              <span className="font-medium text-foreground">
                Experience:
              </span>{" "}
              {trainer.experienceYears} Years
            </p>

            <p>
              <span className="font-medium text-foreground">
                Branch:
              </span>{" "}
              {trainer.branch
                ?.branchName ?? "-"}
            </p>
          </div>

          <div className="flex items-center justify-between border-t pt-3 text-sm">
            <span>
              ⭐{" "}
              {trainer.averageRating.toFixed(
                1,
              )}
            </span>

            <span className="text-muted-foreground">
              {trainer.totalReviews} Reviews
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}